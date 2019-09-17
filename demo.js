    var baseUrl =
        "https://visaya.solutions/en/rest/V1/visaya/search/devices/?categories[]=51&order_by=name&order=asc";
    var current_url;
    var currentPageNo;
    $(function () {

        var slider = new Slider('#ex2', {});
        registerSlider();

        $('.table, #pagination').hide();
        $("#ex2").change(function () {
            registerSlider();
        });
        var apiUrl = new URL(baseUrl + "&current_page=1&per_page=" + $("#item-count").val());
        var prevPageUrl = formApiUrl(apiUrl, 'prev');
        var nextPageUrl = formApiUrl(apiUrl, 'next');
        getProducts(apiUrl, nextPageUrl, prevPageUrl);

        $("#item-count").change(function () {
            var newCountApiUrl = new URL(current_url);
            newCountApiUrl.searchParams.delete('current_page');
            newCountApiUrl.searchParams.delete('per_page');
            newCountApiUrl.searchParams.set('current_page', 1);
            newCountApiUrl.searchParams.set('per_page', $(this).val());
            current_url = newCountApiUrl;
            getProducts(newCountApiUrl, nextPageUrl, prevPageUrl);
        });

        $("#search").click(function () {
            var newSearchApiUrl = new URL(current_url.href);
            if ($("#from_price").text() !== "") {
                newSearchApiUrl.searchParams.set("from_price", $("#from_price").text());
            }
            if ($("#to_price").text() !== "") {
                newSearchApiUrl.searchParams.set("to_price", $("#to_price").text());
            }
            if ($("#gf_piping").is(':checked')) {
                newSearchApiUrl.searchParams.set('manufacturer[]', 1714);
            } else {
                newSearchApiUrl.searchParams.delete('manufacturer[]');
            }
            if ($("#coriolis").is(':checked')) {
                // rectified typo "measurement_technology_parameter"
                // originially shared task document had "measurement_technology_paramet" which didn't return any records
                newSearchApiUrl.searchParams.set('measurement_technology_parameter[]', 274);
            } else {
                newSearchApiUrl.searchParams.delete('measurement_technology_parameter[]');
            }
            if ($("#checmical_applications").is(':checked')) {
                newSearchApiUrl.searchParams.set('industry_or_application[]', 424);
            } else {
                newSearchApiUrl.searchParams.delete('industry_or_application[]');
            }
            getProducts(newSearchApiUrl, nextPageUrl, prevPageUrl);
        });

        $("*[class*=sort]").click(function () {
            var id = $(this).attr('id');
            sortUrl(id, nextPageUrl, prevPageUrl);
        })
    });

    function sortUrl(id, nextPageUrl, prevPageUrl) {
        var newCountApiUrl = new URL(current_url);
        var current_order = newCountApiUrl.searchParams.get('order');
        newCountApiUrl.searchParams.delete('order_by');
        newCountApiUrl.searchParams.delete('order');
        newCountApiUrl.searchParams.set('order', (current_order == 'desc') ? 'asc' : 'desc');
        if (id === 'thName') {
            newCountApiUrl.searchParams.set('order_by', 'name');
        } else if (id === 'thPrice') {
            newCountApiUrl.searchParams.set('order_by', 'price');
        }
        current_url = newCountApiUrl;
        prevPageUrl = formApiUrl(current_url, 'prev');
        nextPageUrl = formApiUrl(current_url, 'next');
        getProducts(newCountApiUrl, nextPageUrl, prevPageUrl);
    }

    function registerSlider() {
        var from_to = $('#ex2').val().split(',');
        $("#from_price").text(from_to[0]);
        $("#to_price").text(from_to[1]);
    }

    function formApiUrl(paramUrl, page, maxPageNo) {
        var newUrl = new URL(paramUrl);
        pageNo = newUrl.searchParams.get("current_page");
        currentPageNo = pageNo;
        if (page === 'prev') {
            prevPageNo = pageNo - 1;
            if ((pageNo - 1) > 0) {
                newUrl.searchParams.set("current_page", prevPageNo);
            } else {
                // newUrl.searchParams.delete("current_page");
                newUrl.href = "";
            }
        } else if (page === 'next') {
            nextPageNo = (parseInt(pageNo) + 1);
            if (maxPageNo !== null && maxPageNo < nextPageNo) {
                newUrl.href = "";
            } else {
                newUrl.searchParams.set("current_page", nextPageNo);
            }
        }
        return newUrl;
    }

    function getProducts(apiUrl, nextPageUrl, prevPageUrl) {
        // console.log('getProducts::', apiUrl.href)
        current_url = apiUrl;
        $.ajax({
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            url: apiUrl,
            success: function (response) {
                var products = response[0].results;
                $("#product_grid tbody").html("");

                $.each(products, function (index, value) {
                    var row = "<tr> <td style='width:150px;'>" + products[index]["name"]+ "</td>";

                    row += "<td >" + products[index]["price"] + "</td>";
                    row += "<td >"
                    row += "<img src='" + products[index]["image"];
                    row += "' style='height:60px;width:90px;'/><br>"+ products[index]["short_description"]+"</td>";
                    row += "<td >" + products[index]["brand"] + "</td>";
                    row += "<td >" + products[index]["sku"] + "</td>";
                    row += "</tr>";
                    $("#product_grid tbody").append(row);

                });

                $("#total-count").html(response[0].paging);

                var maxPageNo = Math.ceil(response[0].paging / $("#item-count").val());

                $('*[id*=pageBtn]').remove();
                for (var i = maxPageNo; i > 0; i--) {
                    $("#prevli").after(
                        '<li class="page-item"><a class="page-link" id="pageBtn-' + i + '" href="#">' + i + '</a></li>'
                    );
                    // console.log('register Link Btns', current_url.href + "&current_page=" + i + "&per_page=" + $("#item-count")
                    // .val());
                    current_url.searchParams.delete('current_page');
                    current_url.searchParams.delete('per_page');
                    registerLinkBtn('pageBtn-' + i, current_url.href + "&current_page=" + i + "&per_page=" + $("#item-count")
                        .val(), maxPageNo);
                }

                if (prevPageUrl.href !== "") {
                    registerLinkBtn('prevA', prevPageUrl, maxPageNo);
                } else {
                    $("#prevA").addClass("disabled");
                }

                if (nextPageUrl.href !== "") {
                    registerLinkBtn('nextA', nextPageUrl, maxPageNo);
                } else {
                    $("#nextA").addClass("disabled");
                }

                $("#pageBtn-" + currentPageNo).addClass('active');
                $('.table, #pagination').show();
            }
        });
    }

    function registerLinkBtn(id, url, maxPageNo) {
        $("#" + id).removeClass("disabled");
        $("#" + id).unbind('click');
        $("#" + id).on("click", function () {
            current_url = new URL(url);

            prevPageUrl = formApiUrl(current_url, 'prev');
            nextPageUrl = formApiUrl(current_url, 'next', maxPageNo);
            currentPageNo = current_url.searchParams.get("current_page");
            getProducts(current_url, nextPageUrl, prevPageUrl);
        });
    }