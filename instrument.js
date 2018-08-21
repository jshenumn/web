var keepXPathObjectHere = null;
var numXPress = 0;

var jsGetPositiveNodes = function () {
    var s = '';
    $(".positiveelement").each(function (index, element) { s = s + (s != '' ? ', ' : '') + $(element).attr('data-dcnode-id'); });
    $(".positiveelement3").each(function (index, element) { s = s + (s != '' ? ', ' : '') + $(element).attr('data-dcnode-id'); });
    return s;
};

var jsGetRelationNodes = function () {
    var result = []
    // see if no grouping is done (treat all nodes as one group)
    if (0 == $(".positiveelement").length) {
        var s = [];
        var o = [];
        $(".positiveelement1").each(function (index, element) { s.push(parseInt($(element).attr('data-dcnode-id'))); });
        $(".positiveelement2").each(function (index, element) { o.push(parseInt($(element).attr('data-dcnode-id'))); });
        if (0 < s.length && 0 < o.length) {
            result.push([s, o]);
        }
        // there are some groups marked
    } else {
        $(".positiveelement").each(function (i, g) {
            var s = [];
            var o = [];
            $(g).find(".positiveelement1").each(function (index, element) { s.push(parseInt($(element).attr('data-dcnode-id'))); });
            $(g).find(".positiveelement2").each(function (index, element) { o.push(parseInt($(element).attr('data-dcnode-id'))); });
            if (0 < s.length && 0 < o.length) {
                result.push([s, o]);
            }
        });
    }
    return result;
};

//highlights the node based on the index passed in and the node relation type (A or B)
var jsHighlightNodes = function (vdom_node_index, node_type) {
    if (1 == $("[data-dcnode-id=" + String(vdom_node_index) + "]").length) {
        var e = $("[data-dcnode-id=" + String(vdom_node_index) + "]").first();
        if (node_type === "a") {
            e.toggleClass('positiveelement1');
        }
        else {
            e.toggleClass('positiveelement2');
        }
    }
};

// returns an inner text string of up to max_len given the VDOM node index
var jsGetInnerText = function (vdom_node_index, max_len) {
    if (1 == $("[data-dcnode-id=" + String(vdom_node_index) + "]").length) {
        var e = $("[data-dcnode-id=" + String(vdom_node_index) + "]").first();
        var innerText = e.text().trim();
        if (innerText.length > max_len) {
            innerText = innerText.substring(0, max_len - 3) + "...";
        }
        return innerText;
    } else {
        return "ERROR: cannot find node " + String(vdom_node_index);
    }
};

var jsGetInnerTextForArray = function (vdom_node_indexes, max_len_ele, max_len) {
    var innerTexts = "";
    for (i = 0; i < vdom_node_indexes.length; ++i) {
        var innerText = jsGetInnerText(vdom_node_indexes[i], max_len_ele);
        if (0 < innerTexts.length) {
            innerTexts += "\n\n";
        }
        innerTexts += innerText;
        if (innerTexts.length > max_len) {
            innerTexts = innerTexts.substring(0, max_len - 3) + "...";
            return innerTexts;
        }
    }
    return innerTexts;
};

var jsGetHtml = function () {
    return $('html').prop('outerHTML');
};

$(window).load(function () {

    var buildXpath = function ($elm, xpath, useid, useclass) {
        var elm = $elm[0];
        var elmTagName = elm.tagName.toLowerCase();
        if (elmTagName === 'html') {
            return 'html > ' + xpath;
        } else {
            var elementPath = elmTagName;
            if (useid && elm.id && xpath != '') {
                elementPath += '#' + elm.id;
            } else if (useclass && elm.className) {
                var elmClasses = elm.className.split(/\s+/)
                for (var i = 0; i < elmClasses.length; i++) {
                    var elmClass = elmClasses[i];
                    if (!elmClass.startsWith("positiveelement") &&
                        !elmClass.startsWith("bhitapp")) {
                        elementPath += '.' + elmClass;
                    }
                }
            }
            if (xpath) {
                elementPath += ' > ';
            }
            return buildXpath($elm.parent(), elementPath + xpath, useid, useclass);
        }
    };

    $('[data-dcnode-id]').mouseenter(
        function () {
            // remove previous focus
            var foc = $('.bhitappfocus');
            foc.removeClass('bhitappfocus');
            var selfoc = $('.bhitappselectedfocus');
            selfoc.removeClass('bhitappselectedfocus');
            // add a new focus
            if ($(this).attr('class') == 'positiveelement' || $(this).attr('class') == 'positiveelement3') {
                $(this).addClass('bhitappselectedfocus');
            } else {
                $(this).addClass('bhitappfocus');
            }
            keepXPathObjectHere = $(this);

        }).mouseleave(
        function () {
            keepXPathObjectHere = null;
            $(this).removeClass('bhitappfocus');
        });

    $('*').keypress(
        function (e) {
            // x -- select by xpath
            if (e.which == 88 || e.which == 120) {
                // select all nodes with the same xpath
                if (keepXPathObjectHere != null) {

                    numXPress = numXPress + 1;

                    var currFocusedElements = $('.bhitappfocus');
                    currFocusedElements.removeClass('bhitappfocus');

                    var keepXPathHere = null;
                    if (0 == (numXPress / 2) % 3) {
                        var keepXPathHere = buildXpath(keepXPathObjectHere, '', true, true);
                        $(keepXPathHere).addClass('bhitappfocus');
                    } else if (0 == (numXPress / 2) % 2) {
                        var keepXPathHere = buildXpath(keepXPathObjectHere, '', false, true);
                        $(keepXPathHere).addClass('bhitappfocus');
                    } else if (0 == (numXPress / 2) % 1) {
                        var keepXPathHere = buildXpath(keepXPathObjectHere, '', false, false);
                        $(keepXPathHere).addClass('bhitappfocus');
                    }
                }

                // * -- multiply records by xpath
            } else if (e.which == 42) {

                if (0 < $(".positiveelement").length) {

                    var g = $(".positiveelement").first();
                    $(g).find(".positiveelement1").each(function (index, element) {
                        var e1XPath = buildXpath($(element), '', true, true);
                        $(e1XPath).addClass('positiveelement1');
                        $(e1XPath).removeClass('positiveelement2');
                    });
                    $(g).find(".positiveelement2").each(function (index, element) {
                        var e2XPath = buildXpath($(element), '', true, true);
                        $(e2XPath).addClass('positiveelement2');
                        $(e2XPath).removeClass('positiveelement1');
                    });
                    var groupXPath = buildXpath(g, '', true, true);
                    $(groupXPath).addClass('positiveelement');

                }

                // z -- remove all selections
            } else if (e.which == 90 || e.which == 122) {
                // get the selection, remove all the DOM node labels
                var selectedElements = $('.positiveelement');
                selectedElements.removeClass('positiveelement');
                selectedElements = $('.positiveelement1');
                selectedElements.removeClass('positiveelement1');
                selectedElements = $('.positiveelement2');
                selectedElements.removeClass('positiveelement2');
                selectedElements = $('.positiveelement3');
                selectedElements.removeClass('positiveelement3');
                // p -- focus on parent
            } else if (e.which == 80 || e.which == 112) {
                var ps = $('.bhitappfocus').closest(':not(.bhitappfocus)');
                ps.addClass('bhitappfocus');
                // c -- focus on children
            } else if (e.which == 99 || e.which == 67) {
                var chs = $('.bhitappfocus > *');
                chs.addClass('bhitappfocus');
                // s -- focus on siblings
            } else if (e.which == 115 || e.which == 83) {
                var chs2 = $('.bhitappfocus').siblings();
                chs2.addClass('bhitappfocus');
                // + -- select focused nodes
            } else if (e.which == 43) {
                // focus which is not selected yet
                var foc = $('.bhitappfocus');
                foc.removeClass('bhitappfocus');
                foc.addClass('positiveelement');
                foc.removeClass('positiveelement3');
                // A/a -- select focused nodes
            } else if (e.which == 65 || e.which == 97) {
                // focus which is not selected yet
                var foc = $('.bhitappfocus');
                foc.removeClass('bhitappfocus');
                foc.removeClass('positiveelement3');
                foc.removeClass('positiveelement2');
                foc.addClass('positiveelement1');
                // B/b -- select focused nodes
            } else if (e.which == 66 || e.which == 98) {
                // focus which is not selected yet
                var foc = $('.bhitappfocus');
                foc.removeClass('bhitappfocus');
                foc.removeClass('positiveelement3');
                foc.removeClass('positiveelement1');
                foc.addClass('positiveelement2');
                // - -- deselect focused nodes
            } else if (e.which == 45) {
                //focus which is not selected yet
                var foc = $('.bhitappfocus');
                foc.removeClass('bhitappfocus');
                foc.removeClass('positiveelement');
                foc.removeClass('positiveelement1');
                foc.removeClass('positiveelement2');

                //selected and with focus
                var sfoc = $('.bhitappselectedfocus');
                sfoc.removeClass('bhitappselectedfocus');
                sfoc.removeClass('positiveelement');
                sfoc.removeClass('positiveelement1');
                sfoc.removeClass('positiveelement2');
                sfoc.removeClass('positiveelement3');
            }
        });
}); //]]> // of $(window).load(function () { ...
