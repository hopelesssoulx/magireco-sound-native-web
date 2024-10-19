<template>
  <div class="movie">
    <div class="flex-between">
      <div class="flex-left">
        <div>
          <span>third party source url = </span>
          <input
            style="width: 260px"
            type="text"
            v-model="tpsUrl"
            placeholder="../resource/"
          />
          <br />

          <span>width = </span>
          <input type="text" v-model="width" placeholder="px / %" />
        </div>
      </div>
      <div>
        <el-button type="primary" @click="$router.push({ name: 'index' })">
          sound native 1
        </el-button>
        <el-button type="primary" @click="$router.push({ name: 'index2' })">
          sound native 2
        </el-button>
      </div>
    </div>

    <el-tabs @tab-click="catrgoryChange">
      <el-tab-pane
        v-for="(category, item, idx) in movie"
        :label="item"
      ></el-tab-pane>
    </el-tabs>

    <el-select
      v-if="categoryData != null && (category == 'char' || category == 'mini')"
      v-model="section"
      class="mb-30"
      placeholder="Select"
      size="large"
      style="width: 240px"
      @change="sectionChange"
    >
      <el-option v-for="(category, item, idx) in categoryData" :value="item" />
    </el-select>

    <el-select
      v-if="otherData != null && category == 'other'"
      v-model="section"
      class="mb-30"
      placeholder="Select"
      size="large"
      style="width: 240px"
      @change="movieFileChange"
    >
      <el-option v-for="(item, idx) in otherData" :value="item.file_name" />
    </el-select>

    <el-select
      v-if="characterData != null"
      v-model="movieFileName"
      class="ml-10 mb-30"
      placeholder="Select"
      size="large"
      style="width: 240px"
      @change="movieFileChange"
    >
      <el-option v-for="(item, idx) in characterData" :value="item.file_name" />
    </el-select>

    <div>
      <div class="loading" v-show="loading">loading.</div>
      <video
        :src="videoUrl"
        style="background: black"
        :style="{ width: width }"
        controls
        autoplay
        muted
      ></video>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
// import { createFFmpeg } from "@ffmpeg/ffmpeg";
import * as config from "../utils/config";
import * as commonApi from "../api/common.js";
export default {
  data() {
    return {
      movie: {},
      categoryData: null, // [], {}
      section: null,
      characterData: null,
      otherData: null,
      movieFileName: "",

      loading: false,
      videoUrl: "",

      width: "300px",

      tpsUrl: "",

      crid: undefined,
      worker: undefined,
    };
  },
  async created() {
    this.getMovie();

    this.crid = new CRID();

    // this.worker = createFFmpeg({ log: true });
    this.worker = FFmpeg.createFFmpeg({ log: true });
    await this.worker.load();
  },
  methods: {
    catrgoryChange(tab, event) {
      let _this = this;
      // _this.section = "";
      // _this.sectionDesc = "";
      // _this.conversationIdxCount = [];
      // _this.conversationData = [];
      // _this.audioList = [];
      // _this.listPre = [];
      // _this.selectionCount = 0;

      _this.section = null;
      _this.characterData = null;
      _this.movieFileName = "";

      _this.category = tab.props.label;
      if (_this.category == "char") {
        _this.categoryData = _this.movie[_this.category];
      }
      if (_this.category == "other") {
        _this.otherData = _this.movie[_this.category];
      }
      if (_this.category == "mini") {
        _this.categoryData = _this.movie[_this.category];
      }
    },
    sectionChange(tab, event) {
      let _this = this;
      // _this.conversationIdxCount = [];
      // _this.conversationData = [];
      // _this.audioList = [];
      // _this.listPre = [];
      // _this.selectionCount = 0;

      // _this.Scene0Section = "";
      // _this.scene0IdxCount = null;

      _this.movieFileName = "";

      _this.section = tab;
      if (_this.category == "char") {
        _this.characterData = _this.movie[_this.category][_this.section];
      }
      if (_this.category == "other") {
      }
      if (_this.category == "mini") {
        _this.characterData = _this.movie[_this.category][_this.section];
      }
    },
    async movieFileChange(tab, event) {
      let _this = this;

      if (_this.tpsUrl != "") {
        if (_this.category == "mini") {
          _this.fn(_this.tpsUrl + "image_native/mini/movie/" + tab);
          return;
        }
        _this.fn(_this.tpsUrl + "movie/" + _this.category + "/" + tab);
      }
      if (_this.tpsUrl == "") {
        _this.fn(
          config.baseUrl + "/getFile/movie/" + _this.category + "/" + tab
        );
      }
    },

    getMovie() {
      let _this = this;
      commonApi.getMovie().then((res) => {
        _this.movie = res.data;
      });
    },

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
              // video = document.getElementsByTagName("video")[0];
              // video.src = URL.createObjectURL(new Blob([stream]));
              _this.videoUrl = URL.createObjectURL(new Blob([stream]));
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
