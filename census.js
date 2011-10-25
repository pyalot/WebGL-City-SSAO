/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

var census = {
    error: function(glee, app, info){
        var caps = this.get_info(glee);
        var user = this.get_user();
        var message = {
            webgl: true,
            error: info,
            caps: caps,
        }
        this.send(app, 'error', message);
    },
    capabilities: function(glee, app){
        var caps = this.get_info(glee);
        var user = this.get_user();
        var message = {
            webgl: true,
            caps: caps,
        };
        this.send(app, 'capabilities', message);
    },
    nowebgl: function(app){
        var user = this.get_user();
        var message = {
            webgl: false,
        };
        this.send(app, 'capabilities', message);
    },
    send: function(app, type, message){
        message.app = app;
        message.user = this.get_user();
        $.ajax({
            contentType: 'text/plain',
            data: JSON.stringify(message),
            type: 'POST',
            url: '/webgl_report/' + type,
        });
    },
    get_user: function(){
        var user = $.cookie('user');
        if(!user){
            var user = '';
            var chars = 'abcdef0123456789'
            for(var i=0; i<32; i++){
                var index = Math.floor(Math.random()*chars.length);
                user += chars.charAt(index);
            }
            $.cookie('user', user, {expires: 365*10, path:'/'});
        }
        return user;
    },
    get_info: function(glee){
        var info = {};
        info.extensions = glee.gl.getSupportedExtensions();
        $.each([
            'VENDOR',
            'VERSION',
            'RENDERER',
            'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
            'MAX_TEXTURE_IMAGE_UNITS',
            'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
            'MAX_CUBE_MAP_TEXTURE_SIZE',
            'MAX_RENDERBUFFER_SIZE',
            'MAX_TEXTURE_SIZE',
            'MAX_VARYING_VECTORS',
            'MAX_VERTEX_ATTRIBS',
            'MAX_TEXTURE_IMAGE_UNITS',
            'MAX_VERTEX_UNIFORM_VECTORS',
            'MAX_VIEWPORT_DIMS'
        ], function(i, name){
            info[name] = glee.get(name);
        });
        return info;
    },
}

