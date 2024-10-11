<template>
  <div>
    <video
      :src="videoUrl"
      style="background: black; max-width: 100%"
      controls
      autoplay
      muted
    ></video>
  </div>
</template>

<script>
// import { createFFmpeg } from "@ffmpeg/ffmpeg";
export default {
  data() {
    return {
      videoUrl: "",

      crid: undefined,
      worker: undefined,
    };
  },
  created() {
    // console.log(abc);
    // console.log(JSON.parse(JSON.stringify(abc)));
    // console.log(this.crid);
    // console.log(this.worker);

    this.crid = new CRID();
    // this.worker = createFFmpeg({ log: true });
    this.worker = FFmpeg.createFFmpeg({ log: true });
    this.worker.load().then(() => {
      let arr = [
        "103305_epilogue",
        "movie_1001",
        "movie_1001_1",
        "movie_1401",
        "movie_3032",
      ];
      let fileName = "http://localhost:16167/getFile/" + arr[2] + ".usm";
      this.fn(fileName);

      setTimeout(() => {
        // this.fn("movie_1001_1.usm")
      }, 8000);
    });
  },
  methods: {
    fn(fileName) {
      let _this = this;
      return __awaiter(void 0, void 0, void 0, function () {
        var res, ab, stream, video;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              let a = [4 /*yield*/, fetch(fileName)];
              return a;
            case 1:
              res = _a.sent();
              return [4 /*yield*/, res.arrayBuffer()];
            case 2:
              ab = _a.sent();
              return [4 /*yield*/, _this.crid.demuxAsync(ab)];
            case 3:
              _a.sent();
              return [4 /*yield*/, _this.mux(_this.crid)];
            case 4:
              stream = _a.sent();
              video = document.getElementsByTagName("video")[0];
              video.src = URL.createObjectURL(new Blob([stream]));
              return [2 /*return*/];
          }
        });
      });
    },
    mux(crid) {
      let _this = this;
      return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, void 0];
            // return [
            //   4 /*yield*/,
            //   _this.worker.isLoaded() ? void 0 : _this.worker.load(),
            // ];
            // return [4 /*yield*/, _this.worker.load()];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                _this.worker.FS("writeFile", "/v.ivf", crid.video),
              ];
              return [4 /*yield*/, _this.worker.write("/v.ivf", crid.video)];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                _this.worker.FS("writeFile", "/a.adx", crid.audio),
              ];
              return [4 /*yield*/, _this.worker.write("/a.adx", crid.audio)];
            case 3:
              _a.sent();
              return [
                4 /*yield*/,
                _this.worker.run(
                  ...["-i", "/v.ivf"],
                  ...["-i", "/a.adx"],
                  "-c:v",
                  "copy",
                  "/o.mp4",
                  "-y"
                ),
              ];
              return [
                4 /*yield*/,
                _this.worker.run("-i /v.ivf -i /a.adx -c:v copy -y /o.mp4"),
              ];
            case 4:
              _a.sent();
              return [4 /*yield*/, _this.worker.FS("readFile", "/o.mp4")];
              return [4 /*yield*/, _this.worker.read("/o.mp4")];
            case 5:
              data = _a.sent();
              return [2 /*return*/, data];
          }
        });
      });
    },
  },
};
</script>
