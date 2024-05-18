(function() {
    const args = (function() {
        const query = window.location.search.substring(1);
        const vars = query.split('&');
        const result = {};
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=');
            result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return result;
    })();
    let url = args.zipconfig;
    if (!url) url = '/epx_packs/v2/dl/zipconfig.json';
    generateZipFromUrl(url, args, function(blob) {
        saveAs(blob, 'epx_recommended_pack-' + (function(length) {
            var result = '';
            for (var i = 0; i < length; i++) {
                result += '0123456789abcdef'.charAt(Math.floor(Math.random() * 16));
            }
            return result;
        })(7) + '-v2.zip');
    });
})();
