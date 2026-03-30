document.addEventListener("DOMContentLoaded", function () {

    fetch("/Header.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("header").innerHTML = data
        })

    fetch("/Footer.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data
        })

})