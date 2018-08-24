from django.utils.safestring import mark_safe

class Pagination(object):
    def __init__(self, totalCount, currentPage, perPageDataNum=10, deliverPageNum=7):
        # perPageDataNum 每页显示数据
        # deliverPageNum 显示的分页码数
        #
        self.total_count = totalCount
        try:
            self.current_page = int(currentPage)
            if self.current_page <= 0:
                self.current_page = 1
            self.current_page = int(currentPage)
        except Exception as e:
            self.current_page = 1
        self.per_page_data_num = perPageDataNum
        self.deliver_page_num = deliverPageNum

    def start(self):
        return (self.current_page-1)*self.per_page_data_num

    def end(self):
        return self.current_page*self.per_page_data_num

    @property
    def num_pages(self):
        a, b = divmod(self.total_count, self.per_page_data_num)
        if b == 0:
            return a
        return a+1

    def page_str(self):
        page_list = []

        if self.num_pages < self.deliver_page_num:
            start_index = 1
            end_index = start_index + self.num_pages
        else:
            if self.current_page <= (self.deliver_page_num + 1) / 2:
                start_index = 1
                end_index = self.deliver_page_num + 1
            else:
                start_index = self.current_page - (self.deliver_page_num - 1) / 2
                end_index = self.current_page + (self.deliver_page_num + 1) / 2
                if (self.current_page + (self.deliver_page_num - 1) / 2) > self.num_pages:
                    end_index = self.num_pages + 1
                    start_index = self.num_pages - self.deliver_page_num + 1

        first = "<li><a >首页</a></li>"
        page_list.append(first)
        for i in range(int(start_index), int(end_index)):
            if i == self.current_page:
                temp = "<li class='active'><a class='active'>{0}</a></li>".format(i)
            else:
                temp = "<li><a>{0}</a></li>".format(i)
            page_list.append(temp)
        last = "<li><a>尾页</a></li>".format(self.num_pages)
        page_list.append(last)

        page_str = mark_safe("".join(page_list))
        return page_str
