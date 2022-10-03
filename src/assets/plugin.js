var anObjectDefinedInPluginJSFile = {
    alert: function() { alert('hallo') },
    issueCard: function(card) {
        let updatedCard = {...card}
        if (/[A-H]/.test(card.title[0]))
            updatedCard.title = '[A-H] ' + card.title;
        console.log(updatedCard.title);
        return updatedCard;
    }
}