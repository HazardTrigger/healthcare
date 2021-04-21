(function() {
 
    /* 定义selector下拉框 */
    let Selector = function(params) {
        /* 初始化 */
        this._initSelector(params);
    };
 
    Selector.prototype = {
        /* 私有方法：初始化下拉框 */
        _initSelector({
            /* 传入id，class，tag，用于挂载下拉框 */
            elementSelector = '',
        
            /* 传入的下拉框选项 */
            options = [{
                name: '请选择你喜欢的颜色',
                value: "0"
            }],
            defaultText = '请选择你喜欢的颜色',
            defaultValue = "0",
            handleClicked = ()=>{

            }
        }) {
            /* 找到要挂载的Dom节点 */
            this.parentElement = document.querySelector(elementSelector) || document.body;
            this.options = options;
            this.defaultText = defaultText;
            this.defaultValue = defaultValue;
            /* 下拉框的显示与隐藏状态 */
            this.downStatus = false;
            this.handleClicked = handleClicked;
            /* 下拉框默认选中的值 */
            this._createElement();
        },
        _createElement() {
            /* 创建下拉框最外层 */
            let dropDown = document.createElement('div');
            dropDown.className = 'dropDown';
         
            /* 已选中的选项值 */
            let selectedOption = document.createElement('div');
            selectedOption.className = 'selectedOption';
         
            /* 选中的值 */
            let selectedValue = document.createElement('span');
            selectedValue.className = 'selectedValue';
            
            /* 先赋值为默认值 */
            selectedValue.innerText = this.defaultText;
            // console.log(this.defaultValue)
            // selectedValue.value = this.defaultValue
            /* 向下的图标 */
            let downIcon = document.createElement('i');
            downIcon.className = 'arrowDown';
         
            /* 将已选中的值的层添加到Dom节点中 */
            selectedOption.appendChild(selectedValue);
            selectedOption.appendChild(downIcon);
         
            /* 创建选项的外层容器 */
            let optionsContainer = document.createElement('div');
            optionsContainer.className = 'optionsContainer';
         
            /* 用ul来包含选项层 */
            let ulOptionsList = document.createElement('ul');
            ulOptionsList.className = 'ulOptionsList';
         
            /* 循环创建每个选项 */
            this.options.forEach((item) => {
                // console.log(item)
                let optionsItem = document.createElement('li');
         
                /* 是否是选中状态 */
                if(item.name == this.defaultText) {
                    optionsItem.className = 'optionsItem itemSelected';
                } else {
                    optionsItem.className = 'optionsItem';
                }
                optionsItem.innerText = item.name;
                optionsItem.value = item.value
                ulOptionsList.appendChild(optionsItem);
            });
         
            /* 添加到每个对应的元素里面 */
            optionsContainer.appendChild(ulOptionsList);
            dropDown.appendChild(selectedOption);
            dropDown.appendChild(optionsContainer);
            this.parentElement.appendChild(dropDown);
         
            /* 设置Dom元素，挂载、绑定事件 */
            /* 已选中的选项的包含层 */
            this.selectedOption = selectedOption;
            /* 选中的值 */
            this.selectedValue = selectedValue;
            /* 下拉框选项包含层 */
            this.optionsContainer = optionsContainer;
            this._handleShowOptions(this.parentElement);
            this._unifyWidth(selectedOption);
            this.handleClicked(+this.defaultValue)
        },
                /* 显示与隐藏事件 */
        _handleShowOptions(element) {
            element.addEventListener('click', (e) => {
                let clickNode = e.target;
        
                this._unifyWidth(this.selectedOption);
        
                /* 点击的是否是下拉框 */
                if(this._isOptionNode(clickNode, this.selectedOption)) {
                    if(this.downStatus) {
                        this._hiddenDropDown();
                    } else {
                        this._showDropDown();
                    }
                } else if(clickNode.className == 'optionsItem') {
                    this._handleSelected(clickNode);
                } else {
                    this._hiddenDropDown();
                }
            })
        },
        /* 判断是否是下拉框选项 */
        _isOptionNode(clickNode, target) {
            if (!clickNode || clickNode === document) return false;
            return clickNode === target ? true : this._isOptionNode(clickNode.parentNode, target);
        },
        /* 显示下拉框选项 */
        _showDropDown() {
            this.optionsContainer.style.transform = 'scale(1, 1)';
            this.optionsContainer.style.opacity = '1';
            this.selectedOption.className = 'selectedOption';
            this.downStatus = true;
        },
        /* 隐藏下拉框选项 */
        _hiddenDropDown() {
            this.optionsContainer.style.transform = 'scale(1, 0)';
            this.optionsContainer.style.opacity = '0';
            this.selectedOption.className = 'selectedOption';
            this.downStatus = false;
        },
          /* 对每个选项的点击事件 */
        _handleSelected(clickNode) {
            this.selectedValue.innerText = clickNode.innerText;
            // this.selectedValue.value = clickNode.value;
            clickNode.className = 'optionsItem itemSelected';
            this._siblingsDom(clickNode, function(clickNode) {
                if(clickNode) {
                    clickNode.className = 'optionsItem';
                }
            });
            this._hiddenDropDown();
            // 点击完成，执行回调函数
            this.handleClicked(+clickNode.value)



        },
        
        /* 兄弟节点处理函数 */
        _siblingsDom(clickNode, callback) {
        
            /* arguments 是一个对应于传递给函数的参数的类数组对象
            * arguments对象是所有（非箭头）函数中都可用的局部变量
            * 包含传递给函数的每个参数，第一个参数在索引0处
            * arguments对象不是一个 Array,它类似于Array，
            * 但除了length属性和索引元素之外没有任何Array属性
            * */
        
            (function (ele) {
                /* arguments.callee
                * 指向当前执行的函数
                * */
                callback(ele);
                if (ele && ele.previousSibling) {
                    arguments.callee(ele.previousSibling);
                }
            })(clickNode.previousSibling);
        
            (function (ele) {
                callback(ele);
                if (ele && ele.nextSibling) {
                    arguments.callee(ele.nextSibling);
                }
            })(clickNode.nextSibling);
        },
                /* 判断宽度 */
        _unifyWidth(selectedOption) {
            /* 找到所有的li标签 */
            let optionsItem = document.querySelectorAll('.optionsItem');
            let standardWidth = selectedOption.offsetWidth;
        
            /* 对每个li标签设置宽度 */
            optionsItem.forEach((item) => {
                standardWidth = item.offsetWidth > standardWidth ? item.offsetWidth : standardWidth;
                item.style.width = standardWidth - 32 + 'px';
                selectedOption.style.width = standardWidth + 'px';
            });
        }
    };
 
    /* 挂载到window上*/
    window.$Selector = Selector;
})();