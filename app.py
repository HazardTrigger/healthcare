import re
import time

import eel
import matplotlib
import matplotlib.pyplot as plt
import mplleaflet
import numpy as np
import pandas as pd
from scipy.stats.kde import gaussian_kde

eel.init('web')


def callback(page, sockets):
    print(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())),
          "close page: {} current visitor: {}".format(page, len(sockets)))


def timeFormatTransform(t):
    tmp = time.strptime(t, '%Y-%m-%d')
    return time.strftime("%b.%d", tmp)


def minmaxScalerCustome(X, min, max, MIN, MAX):
    X_std = (X - MIN) / (MAX - MIN)
    X_scaled = X_std * (max - min) + min
    return X_scaled


@eel.expose
def processdata(data, mode='static'):
    countryFlow = []
    for d in data:
        flowFps = []
        for i in range(len(d) - 1):
            df1 = pd.DataFrame(d[i])
            df2 = pd.DataFrame(d[i + 1])
            dateRange1 = df1['dateRange'].tolist()[0]
            dateRange2 = df2['dateRange'].tolist()[0]
            mapCenter = df1['center'].tolist()[0]
            color = df1['color'].to_numpy()[0]
            state = df1['state'].tolist()
            df1['lon'] = df1['lon'].astype(float)
            df1['lat'] = df1['lat'].astype(float)
            df1['weight'] = df1['weight'].astype(float)
            df2['weight'] = df2['weight'].astype(float)

            rate, flowdata = diff_model(np.array(df1['lon']),
                                        np.array(df1['lat']),
                                        np.array(df1['weight']),
                                        np.array(df2['weight']), mode, color)

            mainflow = genFlowData(flowdata)
            subflow = genFlowDataForsub(flowdata)
            flowFps.append({
                'subflow': subflow,
                'mainflow': mainflow,
                'dateRange': [timeFormatTransform(dateRange1[0].split("T")[0]),
                              timeFormatTransform(dateRange2[1].split("T")[0])],
                'mapCenter': mapCenter,
                'rate': rate,
                'state': state[0],
                'index': i + 1
            })
        countryFlow.append(flowFps)
    countryFlow = minmaxScaleRate(countryFlow)
    return countryFlow


def minmaxScaleRate(countryFlow):
    rateConcat = []
    for flowFps in countryFlow:
        rateConcat += [t['rate'] for t in flowFps]

    rateConcat = np.concatenate(rateConcat, axis=0)
    MIN = np.min(rateConcat)
    MAX = np.max(rateConcat)
    for flowFps in countryFlow:
        for t in flowFps:
            t['rate'] = minmaxScalerCustome(t['rate'], 0, 1, MIN, MAX)
            t['rate'] = np.mean(t['rate'])
    return countryFlow


def diff_model(lon, lat, weight1, weight2, mode, color):
    kde1 = gaussian_kde(np.vstack([lon, lat]), weights=weight1)
    kde2 = gaussian_kde(np.vstack([lon, lat]), weights=weight2)

    x, y = np.mgrid[lon.min():lon.max():40 * 1j, lat.min():lat.max():40 * 1j]

    z1 = kde1.evaluate(np.vstack([x.flatten(), y.flatten()]))
    z2 = kde2.evaluate(np.vstack([x.flatten(), y.flatten()]))
    z1 = z1.reshape(x.shape)
    z2 = z2.reshape(x.shape)

    Z = z2 - z1

    derivation = np.gradient(Z)
    rate = np.sqrt((derivation[0]) ** 2 + (derivation[1]) ** 2)
    submask = rate > np.mean(rate)
    # fScale = 0.8
    # if np.mean(rate) > 0.002:
    #     fScale = 0.2
    fig = genFlowFig(x, y, derivation, width=0.003, scale=0.2, color=color, mask=submask)

    if mode == 'static':
        return rate, mplleaflet.fig_to_geojson(fig=fig)

    return {"message": "error"}


def genFlowFig(x, y, derivation, width, scale, color, mask=None):
    if mask is not None:
        ix = x[mask]
        iy = y[mask]
        d1 = derivation[0][mask]
        d2 = derivation[1][mask]
    else:
        ix = x
        iy = y
        d1 = derivation[0]
        d2 = derivation[1]

    # https://stackoverflow.com/questions/44279270/colormap-with-colored-quiver
    # norm = matplotlib.colors.Normalize()
    # norm.autoscale(c)
    # cm = matplotlib.cm.magma_r

    fig = plt.figure()
    Q = plt.quiver(
        ix, iy, d1, d2,
        color=color,
        # width=width,
        headwidth=3,
        headlength=5,
        # angles='xy',
        # scale=scale,
        # scale_units='xy'
    )
    return fig


def genFlowDataForsub(flow):
    features = []
    for arrow in flow['features']:
        if arrow['geometry']['type'] == 'Point':
            features.append(arrow)

    flow['features'] = features
    return flow


def genFlowData(flow):
    features = []
    for arrow in flow['features']:
        if arrow['geometry']['type'] == 'Point':
            features.append(arrow)

    flow['features'] = features

    mainflow = [
        {
            "lnglat": arrow['geometry']['coordinates'],
            'fill': re.findall('fill="(.+?)"', arrow['properties']['html'])[0],
            'arrowPath': re.findall('d="(.+?)"', arrow['properties']['html'])[0]
        }
        for arrow in flow['features']
    ]

    return mainflow


# For testing. host is the IP address of the server, pay attention to whether the listening port is blocked by the
# firewall，
# eel.start("index.html", host="159.226.74.234", port=80, mode=None, close_callback=callback)

# For Development
eel.start("index.html", mode="chrome-app")
