webViewTools={
    disableAnchors: function(){
        var elements = document.getElementsByClassName('offline-disable')
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i]
            console.log(element)
            element.href="javascript:void(0)"
            element.classList.add('disabled')
            element.setAttribute('style', "pointer-events: none;")
        }
        // disable booking tabs links
        // var elements2 = document.getElementById('bookings').getElementsByClassName('nav-link')
        // for (var i = 0; i < elements2.length; i++) {
        //     var element = elements2[i]
        //     console.log(element)
        //     element.href="javascript:void(0)"
        //     element.classList.add('disabled')
        //     element.setAttribute('style', "pointer-events: none;")
        // }
    }
}