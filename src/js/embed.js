import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML;

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata/1bRz4W9fo4IFrdwq8gj44H77tdZtvyJ9k_LJt614scpg.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => buildView( resp )
    });
};

// success: (resp) => el.querySelector('.test-msg').innerHTML = `Your IP address is ${resp.ip}`

function buildView ( data ) {
    console.log( data );
}