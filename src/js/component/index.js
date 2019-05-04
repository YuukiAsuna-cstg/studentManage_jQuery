
(function () {
    function TurnPage(options) {
        this.wrap = options.wrap;
        this.active = options.active || 1;
        this.allPage = options.allPage || 1;
        this.callback = options.callback || function () {};
        if(this.active > this.allPage){
            alert('请输入正确页码！');
            return false;
        }
        this.createPage();
        this.bindEvent();
    }
    TurnPage.prototype.createPage = function () {
        $(this.wrap).empty();
        // 添加上一页按钮
        if(this.active > 1){
            $(this.wrap).append($('<li class="prev-page">上一页</li>'));
        }
        else{
            $(this.wrap).remove('.prev-page');
        }

        // 添加第一页
        if(this.active != 1 && this.active - 2 > 1){
            $(this.wrap).append($('<li class="tab-number">1</li>'));
        }

        // 添加左侧省略号
        if(this.active - 2 > 2){
            $(this.wrap).append($('<span>...</span>'));
        }

        // 渲染当前页左右两页
        for(var i = this.active - 2; i <= this.active + 2; i++){
            if(i > 0 && i <= this.allPage){
                var oLi = $('<li class="tab-number">'+ i +'</li>');
                $(this.wrap).append(oLi);
                if(i == this.active){
                    oLi.addClass('active');
                }
            }
        }

        // 添加右侧省略号
        if(this.allPage - this.active > 3){
            $(this.wrap).append($('<span>...</span>'));
        }

        // 添加最后一页
        if(this.active + 2 < this.allPage){
            $('<li class="tab-number">'+ this.allPage +'</li>').appendTo($(this.wrap));
        }

        // 添加下一页按钮
        if(this.active < this.allPage){
            $(this.wrap).append($('<li class="next-page">下一页</li>'));
        }
        else{
            $(this.wrap).remove('.next-page');
        }
    };

    TurnPage.prototype.bindEvent = function () {
        var self = this;
        $('.prev-page', this.wrap).on('click', function (e) {
            self.active --;
            self.changePage();
        });
        $('.next-page', this.wrap).on('click', function (e) {
            self.active ++;
            self.changePage();
        });
        $('.tab-number', this.wrap).on('click', function () {
            var curPage = parseInt( $(this).text() );
            self.active = curPage;
            self.changePage(this.active);
        })
    };

    TurnPage.prototype.changePage = function () {
        this.createPage();
        this.bindEvent();
        this.callback();
    };

    $.fn.extend({
        turnPage : function (options) {
            options.wrap = this;
            new TurnPage(options);
            return this;
        }
    })
})();