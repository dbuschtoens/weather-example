"use strict";
const tabris_1 = require("tabris");
var page = new tabris_1.Page();
function test_events() {
    var listener = () => console.log("triggered");
    var widget = new tabris_1.Composite();
    widget.on("foo", listener);
    widget.trigger("foo", "details");
    widget.off("foo", listener);
    widget.off("foo");
    widget.off(null, listener);
    widget.off();
}
function test_Action() {
    var widget = new tabris_1.Action();
    widget.set("foo", 23);
    widget.set({
        image: { src: "http://example.org" },
        title: "foo",
        placementPriority: "high"
    });
    var self = widget.on("event", function (widget) { });
}
function test_Button() {
    var widget = new tabris_1.Button();
    widget.set("foo", 23);
    widget.set({
        width: 200,
        height: 400,
        alignment: "center",
        image: { src: "http://example.org" },
        text: "foo"
    });
}
function test_CheckBox() {
    var widget = new tabris_1.CheckBox();
    widget.set("foo", 23);
    widget.set({
        selection: true,
        text: "foo"
    });
}
function test_Canvas() {
    var widget = new tabris_1.Canvas();
    widget.set("foo", 23);
    widget.set({});
    var ctx = widget.getContext("2d", 200, 300);
}
function test_Cell() {
    var widget = new tabris_1.Cell();
    widget.set("foo", 23);
    widget.set({});
}
function test_CollectionView() {
    var widget = new tabris_1.CollectionView();
    widget.set("foo", 23);
    widget.set({
        cellType: (item) => "foo",
        initializeCell: (cell, type) => { },
        itemHeight: (item, type) => 23,
        items: ["foo", "bar", "baz"],
        refreshEnabled: true,
        refreshIndicator: true,
        refreshMessage: "foo"
    });
    widget.insert(["item1", "item2"]);
    widget.insert(["item1", "item2"], 3);
    widget.refresh();
    widget.refresh(3);
    widget.remove(3);
    widget.remove(3, 2);
    widget.reveal(23);
}
function test_Composite() {
    var widget = new tabris_1.Composite();
    widget.set("foo", 23);
    widget.set({});
}
function test_Drawer() {
    var widget = new tabris_1.Drawer();
    widget.set("foo", 23);
    widget.set({});
    var same = widget.open();
    var same = widget.close();
}
function test_ImageView() {
    var widget = new tabris_1.ImageView();
    widget.set("foo", 23);
    widget.set({
        image: { src: "http://example.com" },
        scaleMode: "auto"
    });
}
function test_Page() {
    var page = new tabris_1.Page();
    page.set("foo", 23);
    page.set({
        image: { src: "http://example.com" },
        title: "foo",
        topLevel: true
    });
    page.open().close();
}
function test_PageSelector() {
    var widget = new tabris_1.PageSelector();
    widget.set("foo", 23);
    widget.set({});
}
function test_Picker() {
    var widget = new tabris_1.Picker();
    widget.set("foo", 23);
    widget.set({
        selection: "foo",
        selectionIndex: 23,
        items: ["foo", "bar", "baz"]
    });
}
function test_ProgressBar() {
    var widget = new tabris_1.ProgressBar();
    widget.set("foo", 23);
    widget.set({
        minimum: 0,
        maximum: 100,
        selection: 23,
        state: "normal"
    });
}
function test_RadioButton() {
    var widget = new tabris_1.RadioButton();
    widget.set("foo", 23);
    widget.set({
        selection: true,
        text: "foo"
    });
}
function test_ScrollView() {
    var widget = new tabris_1.ScrollView();
    widget.set("foo", 23);
    widget.set({
        direction: "horizontal"
    });
}
function test_SearchAction() {
    var widget = new tabris_1.SearchAction();
    widget.set("foo", 23);
    widget.set({
        message: "foo",
        proposals: ["foo", "bar", "baz"],
        text: "foo"
    });
}
function test_Slider() {
    var widget = new tabris_1.Slider();
    widget.set("foo", 23);
    widget.set({
        minimum: 0,
        maximum: 100,
        selection: 23
    });
}
function test_Switch() {
    var widget = new tabris_1.Switch();
    widget.set("foo", 23);
    widget.set({
        selection: true
    });
}
function test_TextInput() {
    var widget = new tabris_1.TextInput();
    widget.set("foo", 23);
    widget.set({
        alignment: "center",
        autoCapitalize: true,
        autoCorrect: false,
        editable: true,
        text: "foo",
        message: "bar",
        type: "search",
        keyboard: "ascii"
    });
}
function test_Tab() {
    var tab = new tabris_1.Tab();
    tab.set("foo", 23);
    tab.set({
        badge: "foo",
        title: "bar",
        image: { src: "http://example.org" }
    });
    var folder = new tabris_1.TabFolder();
    tab.appendTo(folder);
}
function test_TabFolder() {
    var widget = new tabris_1.TabFolder();
    widget.set("foo", 23);
    widget.set({
        paging: true,
        tabBarLocation: "auto",
        selection: tab1
    });
    var tab1, tab2;
    var same = widget.append(tab1, tab2);
}
function test_TextView() {
    var widget = new tabris_1.TextView();
    widget.set("foo", 23);
    widget.set({
        alignment: "center",
        markupEnabled: true,
        maxLines: 23,
        text: "foo"
    });
    widget.set("maxLines", 23);
    widget.set("maxLines", () => 42);
}
function test_ToggleButton() {
    var widget = new tabris_1.ToggleButton();
    widget.set("foo", 23);
    widget.set({
        alignment: "center",
        image: { src: "http://example.org/" },
        selection: true,
        text: "foo"
    });
}
function test_Video() {
    var widget = new tabris_1.Video();
    widget.set("foo", 23);
    widget.set({
        url: "http://example.org"
    });
}
function test_WebView() {
    var widget = new tabris_1.WebView();
    widget.set("foo", 23);
    widget.set({
        html: "<html>",
        url: "http://example.org"
    });
}
function test_WidgetCollection() {
    var collection = page.find();
    var length = collection.length;
    var grandParents = collection.parent().parent();
    var grandChildren = collection.children().children();
    var found = collection.find().find(".class");
    collection.appendTo(page);
    collection.dispose();
}
function test_tabris_app() {
    tabris_1.app.installPatch("url", (error, patch) => { });
    tabris_1.app.reload();
}
function test_tabris_device() {
    var lang = tabris_1.device.get("language");
    var model = tabris_1.device.get("model");
    var orient = tabris_1.device.get("orientation");
    var platform = tabris_1.device.get("platform");
    var factor = tabris_1.device.get("scaleFactor");
    var height = tabris_1.device.get("screenHeight");
    var width = tabris_1.device.get("screenWidth");
    var version = tabris_1.device.get("version");
    var same = tabris_1.device.on("change:orientation", () => { }).off("change:orientation");
}
function test_tabris_ui() {
    var page = tabris_1.ui.get("activePage");
    var bg = tabris_1.ui.get("background");
    var tc = tabris_1.ui.get("textColor");
    var visible = tabris_1.ui.get("toolbarVisible");
    var same = tabris_1.ui.on("change:activePage", () => { }).off("change:activePage");
}
