/*
 * Customized js for Thomas's Blog.
 * Thomas.Zhao, 2015-01-13
 */

Array.prototype.fill = function(value, start, length) {
    while (length--){
        if (length >= start)
          this[length] = value;
    }
    return this;
}

function build_toc(h_cnt, hid, h_id, n, open, close, item_a, tocid_suffix, tocid_prefix) {
    h_cnt[n] ++;
    if (h_cnt[n] > 1)
      h_cnt.fill(0, n+1, h_cnt.length);

    if (n == 0)
      h_id[n] = tocid_prefix.concat(h_cnt[0]);
    else {
      hid[n] = h_id[n-1].concat(tocid_suffix);
      h_id[n] = hid[n].concat("-", h_cnt[n]);
    }

    $("<i class='icon-fixed-width icon-" + close +"' onclick=\"click_toc('#" + "".concat(h_id[n], "','", open, "','", close) + "')\"></i>").prependTo(item_a);
    var li_a = $("<li id='" + h_id[n] +"'></li>").append(item_a);

    if (n == 0)
      return li_a;

    if (h_cnt[n] > 1)
      var nav_li_a = $("#" + hid[n]).append(li_a);
    else
      var nav_li_a = $("<ul class='nav' id='" + hid[n] +"'></ul>").append(li_a);

    if (n == 1)
      return nav_li_a;
    else if (n == 2) {
      return $("#" + hid[n-1]).append(nav_li_a);
    } else if (n == 3) {
      return $("#" + hid[n-2]).append($("#" + hid[n-1]).append(nav_li_a));
    } else {
      return $("#" + hid[n-3]).append($("#" + hid[n-2]).append($("#" + hid[n-1]).append(nav_li_a)));
    }

    return null;
}

var Toc = {
    /*
     * Toc Affixing
     *
     * reference to:
     * https://github.com/twbs/bootstrap/blob/master/docs/assets/js/src/application.js#L35
     */
    setTocAffixing:function() {

        /* Scrollspy */
        var $window = $(window);
        var $body   = $(document.body);

        $body.scrollspy({
            target: '.toc_widget_container'
        });
        $window.on('load', function () {
            $body.scrollspy('refresh')
        });

        /* Kill links */
        $('#main_content_container [href=#]').click(function (e) {
            e.preventDefault()
        });
    }, /* end of setTocAffixing:function() */


    /* Generate directory tree
     *
     * toc_widget_content: side navigation element
     * main_content_container:  article body container.
     *
     * processing: search header elements(h1,h2,h3) in `main_content_container`,
     * generate directory tree list, and put them into toc_widget_content.
     */
    createToc:function (toc_widget_content, main_content_container, toc_widget){
        if(!toc_widget || main_content_container.length < 1 ||
                !toc_widget_content) {
            return false;
        }

        var nodes = main_content_container.find("h1,h2,h3,h4,h5");
        var ultoc = toc_widget_content;

        var node_num = 0;
        var h1, h1_n = 2;
        var h_cnt = new Array(0, 0, 0, 0, 0);
        var h_id = new Array("", "", "", "");
        var hid = new Array("", "", "", "");
        $.each(nodes,function(){
            var anchorPrefix = 'tocAnchor-';
            var tocid_prefix = 'ctg-';
            var tocid_suffix = '-cld';
            var icon_close = 'angle-right';
            var icon_open = 'angle-down';
            var $this = $(this);

            var nodetext = $this.text();

            // There maybe HTML tags in header inner text, use regex to erase them
            nodetext = nodetext.replace(/<\/?[^>]+>/g,"");
            nodetext = nodetext.replace(/&nbsp;/ig, "");

            // btw: Jekyll generates id for each header.
            var nodeid = $this.attr("id");
            if(!nodeid) {
                var anchorId = anchorPrefix + "_" + node_num;
                $(this).attr('id', anchorId);
                nodeid = anchorId;
            }

            var item_a = $("<a title='" + nodetext +"'></a>");
            item_a.attr("href", "#" + nodeid);
            item_a.text(nodetext);

            if (node_num == 0) {
                switch($this.get(0).tagName) {
                case "H1":
                    h1 = "H1";
                    break;
                case "H2":
                    h1 = "H2";
                    break;
                case "H3":
                    h1 = "H3";
                    break;
                case "H4":
                    h1 = "H4";
                    break;
                }
                h1_n = parseInt(h1.replace("H", ""));
            }

            var ret_li;
            var h_ol;
            /* wrapper: ul ( in the template, outside this code ) */
            /* h1: layer 1: li - a */
            /* h2: layer 2: ul - li - a */
            /* h3: layer 3: ul - ul - li - a */
            /* h4: layer 4: ul - ul - ul - li - a */
            /* h5: layer 5: ul - ul - ul - ul - li - a */
            h = $this.get(0).tagName;
            var n = parseInt(h.replace("H", ""));

            ret_li = build_toc(h_cnt, hid, h_id,  n - h1_n, icon_open, icon_close, item_a, tocid_suffix, tocid_prefix);

            h_ol = h_cnt.slice(0, n + 1 > h_cnt.length ? h_cnt.length : n + 1);
            $(this).prepend("<ahead>" + h_ol.join('.') + "</ahead> ");

            if(!ret_li) {
                /* do nothing */
            } else {
                ultoc.append(ret_li);
            }

            node_num ++;
        });  /* end of each */

        /* show the table of content */
        if (node_num > 0)
	    toc_widget.show();

    } /* end of createToc:function() */
};


jQuery(function($) {
    $(document).ready( function() {
        /* Generate the side navigation `ul` elements */
        Toc.createToc($("#toc_widget_content"), $("#main_content_container"), $("#toc_widget"));

        /* caculate affixing */
        Toc.setTocAffixing();
    });
});
