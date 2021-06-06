self.addEventListener('install', function(event) {
  console.log("good");
  event.waitUntil(
    caches.open('files').then(function(cache) {
      return cache.addAll(
        [
          'NstDatabase.xml',
          '/css/main.css',
          '/js/jsnes.min.js',
          '/js/webnes.js',
          '/', '/js/sw.js', '/images/down_arrow.png', '/images/left_arrow.png', '/images/right_arrow.png', '/images/up_arrow.png', '/images/a_button.png', '/images/b_button.png', '/images/start_button.png', '/images/select_button.png', '/images/apple-touch-icon-120.png', '/images/apple-touch-startup-image-1536x2008.png', '/images/apple-touch-startup-image-2048x1496.png', '/images/apple-touch-startup-image-320x460.png', '/images/apple-touch-startup-image-640x1096.png', '/images/apple-touch-startup-image-640x920.png', '/images/apple-touch-startup-image-748x1024.png', '/images/apple-touch-startup-image-768x1004.png', '/images/logo.png', '//fonts.googleapis.com/css?family=Sen&display=swap', '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css', '//ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js', '//www.dropbox.com/static/api/1/dropins.js', '/roms/BOXBOY.nes', '/roms/croom.nes', '/roms/fighter_f8000.nes', '/roms/galaxy.nes', '/roms/lj65.nes', '/js/jquery.min.js', '/fonts/Sen.ttf'
        ]
      );
    })
  );
});
self.addEventListener('fetch', function(event) {
  return response || fetch(event.request);
  });