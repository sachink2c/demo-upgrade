function openChatbotPane(executionContext) {
    //alert("Opening AI Assistant pane...");
    var paneId = "tc_chatbot_sidebar";

    var existingPane = Xrm.App.sidePanes.getPane(paneId);
    if (existingPane) {
        //alert("AI Assistant pane is already open. Focusing on it.");
        existingPane.select();
        return;
    }

    //alert("Creating new AI Assistant pane...");
    Xrm.App.sidePanes.createPane({
        title: "AI Assistant",
        paneId: paneId,
        canClose: true,
        width: 420
    }).then(function (pane) {
        pane.navigate({
            pageType: "webresource",
            webresourceName: "tc_customchatbot"
        });
    }).catch(function (error) {
        console.error("Failed to open chatbot pane", error);
    });
}