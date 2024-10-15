<template>
  <div class="movie">
    <div class="flex-between mb-30">
      <div class="flex-left"></div>
      <div>
        <el-button type="primary" @click="$router.push({ name: 'index' })">
          sound native 1
        </el-button>
        <el-button type="primary" @click="$router.push({ name: 'index2' })">
          sound native 1
        </el-button>
      </div>
    </div>
    <div class="loading" v-show="loading">loading.</div>
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
      loading: true,
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
        "op_movie",
        "op_movie2",
        "op_movie3",
      ];
      let fileName = "http://localhost:16167/getFile/" + arr[0] + ".usm";
      // this.fn(fileName);

      setTimeout(() => {
        // this.fn("movie_1001_1.usm")
      }, 8000);
    });
  },
  methods: {
    fn(fileName) {
      let _this = this;
      _this.loading = true;
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
              _this.loading = false;
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

<style>
.el-table .stripe {
  --el-table-tr-bg-color: #fafafa;
}

.ml-10 {
  margin-left: 10px;
}
.mb-30 {
  margin-bottom: 30px;
}
.flex-left {
  display: flex;
  justify-content: left;
  align-items: center;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file {
  cursor: pointer;
}
.file::after {
  display: block;
  content: "";
  border-bottom: 2px solid #808080;
  width: 0;
  transition: width 0.3s ease-in-out;
}
.file:hover::after {
  width: 100%;
}

.loading:after {
  overflow: hidden;
  display: inline-block;
  vertical-align: bottom;
  -webkit-animation: ellipsis steps(3, end) 3000ms infinite;
  animation: ellipsis steps(3, end) 3000ms infinite;
  content: "\2026";
  /* ascii code for the ellipsis character */
  width: 0px;
}

@keyframes ellipsis {
  to {
    width: 11px;
  }
}

@-webkit-keyframes ellipsis {
  to {
    width: 11px;
  }
}
</style>
