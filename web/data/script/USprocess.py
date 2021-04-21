import datetime as dt
import time

import pandas as pd
import numpy as np
import folium
from folium.plugins import HeatMap


def str2Timestamp(s):
    timeArray = time.strptime(s, "%m-%d-%Y")
    return time.mktime(timeArray)


def timestamp2Str(second):
    t = time.localtime(second)
    return time.strftime("%m-%d-%Y", t)


def strTimeReformat(s):
    timeArray = time.strptime(s, "%m-%d-%Y")
    return time.strftime("%Y-%m-%d", timeArray)


# usecols = []
# startDate = str2Timestamp('03-22-2020')
#
# for i in range(763 - 2):
#     t = timestamp2Str(startDate)
#     usecols.append(t)
#     startDate += 86400.0
#     if t == '05-29-2020':
#         break
#
# tmpdf = pd.DataFrame()
# for date in usecols:
#     tmpdata = pd.read_csv("../data_unprocess/US/csse_covid_19_daily_reports/{}.csv".format(date), dtype=str)
#     # country_region = np.unique(tmpdata['Country_Region'].to_numpy())
#     # for country, group in tmpdata.groupby('Country_Region'):
#     #     print(country, group.shape[0])
#     tmpdata = tmpdata[tmpdata['Country_Region'] == 'US']
#     tmpdata.drop(tmpdata[(tmpdata['Lat'] == '0')].index, inplace=True)
#     tmpdata.dropna(inplace=True)
#     # https://stackoverflow.com/questions/30132282/datetime-to-string-with-series-in-python-pandas
#     tmpdata['Last_Update'] = strTimeReformat(date)
#     # tmpdata['Last_Update'] = tmpdata['Last_Update'].apply(lambda x: x.strftime('%Y-%m-%d'))
#     tmpdf = pd.concat([tmpdf, tmpdata], sort=False)
#
#     # break
#
# tmpdf.to_csv("../data_processed/US.csv", index=False)

# tmpdf = pd.read_csv("../data_processed/US.csv", usecols=[
#     'FIPS', 'Admin2', 'Province_State', 'Country_Region', 'Last_Update', 'Lat',
#     'Long_', 'Confirmed', 'Deaths', 'Recovered', 'Active'
# ])
#
# tmpdf.rename(columns={
#     'Admin2': 'county',
#     'Province_State': 'state',
#     'Country_Region': 'country',
#     'Last_Update': 'date',
#     'Lat': 'lat',
#     'Long_': 'lon',
#     'Confirmed': 'confirmed',
#     'Deaths': 'death',
#     'Recovered': 'recovered',
#     'Active': 'active'
# }, inplace=True)
#
# tmpdf.to_csv("../data_processed/american.csv", index=False)
# latlng = tmpdf[['Lat', 'Long_']].astype(float).to_numpy()
# latlng = np.unique(latlng, axis=0)
#
# map_osm = folium.Map(location=[tmpdf['Lat'].astype(float).mean(), tmpdf['Long_'].astype(float).mean()], zoom_start=5)
# HeatMap(data=latlng).add_to(map_osm)
# file_path = "../script/us.html"
# map_osm.save(file_path)

states = [
    "New York",
    "Washington",
    "New Jersey",
    "California",
    "Illinois",
    "Michigan",
    "Florida",
    "Louisiana",
    "Massachusetts",
    "Texas",
    "Georgia",
    "Colorado",
    "Pennsylvania",
    "Tennessee",
    "Wisconsin",
    "Ohio",
    "Connecticut",
    "North Carolina",
    "Maryland",
    "Virginia",
    "Mississippi",
    "Indiana",
    "South Carolina",
    "Nevada",
    "Utah",
    "Minnesota",
    "Arkansas",
    "Oregon",
    "Alabama",
    "Arizona",
    "Kentucky",
    "Missouri",
    "Iowa",
    "Maine",
    "Rhode Island",
    "New Hampshire",
    "Oklahoma",
    "Kansas",
    "New Mexico",
    "Hawaii",
    "Delaware",
    "Vermont",
    "Nebraska",
    "Idaho",
    "Montana",
    "North Dakota",
    "Wyoming",
    "South Dakota",
    "Alaska",
    "West Virginia",
    "District of Columbia"
]
data = pd.read_csv("../data_processed/american.csv")

alldf = pd.DataFrame()
for state in states:
    statedf = pd.DataFrame(data[data['state'] == state])
    lnglat = None
    jdf = pd.DataFrame()

    maxCountylen = 0
    for date, dateGroup in statedf.groupby('date'):
        tmpdatedf = pd.DataFrame(dateGroup)
        countyName = tmpdatedf['county'].to_numpy()
        print(state, date, len(countyName))
#         if len(countyName) > maxCountylen:
#             maxCountylen = len(countyName)
#             lnglat = tmpdatedf[['FIPS', 'county', 'lon', 'lat']]
#
#     for date, dateGroup in statedf.groupby('date'):
#         cdf = pd.DataFrame(dateGroup)
#         countyName = cdf['county'].to_numpy()
#         if len(countyName) < maxCountylen:
#             mdf = pd.merge(left=cdf, right=lnglat, on='county', how='outer')
#             mdf.rename(columns={
#                 'lon_y': 'lon',
#                 'lat_y': 'lat',
#                 'FIPS_y': 'FIPS'
#             }, inplace=True)
#
#             mdf.drop(['lon_x', 'lat_x', 'FIPS_x'], axis=1, inplace=True)
#             mdf['date'].fillna(value=date, inplace=True)
#             mdf['state'].fillna(value=state, inplace=True)
#             mdf['country'].fillna(value='US', inplace=True)
#             mdf['confirmed'].fillna(value=0, inplace=True)
#             mdf['death'].fillna(value=0, inplace=True)
#             mdf['recovered'].fillna(value=0, inplace=True)
#             mdf['active'].fillna(value=0, inplace=True)
#             jdf = pd.concat([jdf, mdf], sort=False)
#         else:
#             jdf = pd.concat([jdf, cdf], sort=False)
#
#     alldf = pd.concat([alldf, jdf], sort=False)
#
# alldf.to_csv("../data_processed/american.csv", index=False)

# data = pd.read_csv("../data_processed/american.csv")
#
# data.drop(data[data['state'] == "Rhode Island"].index, inplace=True)
# data.drop(data[data['state'] == "District of Columbia"].index, inplace=True)
# data.drop(data[data['state'] == "Washington"].index, inplace=True)
# data.drop(data[data['state'] == "Alaska"].index, inplace=True)
# data.drop(data[data['state'] == "Hawaii"].index, inplace=True)
#
# data.to_csv("../data_processed/american.csv", index=False)

data = pd.read_csv("../data_processed/american.csv")
data['active'] = data['confirmed'] - data['death']
t = data['active'].to_numpy()
t = np.where(t < 0, -1, t)
