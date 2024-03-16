<template>
  <div class="index">
    <div>
      <span>key1=</span><input type="text" v-model="hcaKey1" />
      <span class="ml-10">key2=</span><input type="text" v-model="hcaKey2" />
      <br />
      <span>decoding mode: </span
      ><input type="number" step="8" min="0" max="32" v-model="hcaMode" />
      <span class="ml-10">loop count: </span
      ><input type="number" step="1" min="0" max="99" v-model="hcaLoopCount" />
      <span class="ml-10">volume: </span
      ><input type="number" step="1" min="0" max="100" v-model="hcaVolume" />
    </div>

    <el-tabs @tab-click="catrgoryChange">
      <el-tab-pane
        v-for="(category, item, idx) in soundNative"
        :label="item"
      ></el-tab-pane>
    </el-tabs>

    <!-- <el-tabs @tab-click="sectionChange">
      <el-tab-pane
        v-for="(category, item, idx) in categoryData"
        :label="item"
      ></el-tab-pane>
    </el-tabs> -->

    <!-- <el-dropdown v-if="categoryData != null">
      <el-button type="primary">
        Arc 1<el-icon class="el-icon--right"><i-ep-arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="(category, item, idx) in categoryData">{{
            item
          }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown> -->

    <el-select
      v-if="categoryData != null"
      v-model="section"
      placeholder="Select"
      size="large"
      style="width: 240px"
      @change="sectionChange"
    >
      <el-option v-for="(category, item, idx) in categoryData" :value="item" />
    </el-select>
    <el-select
      v-if="scene0IdxCount != null"
      v-model="Scene0Section"
      class="ml-10"
      placeholder="SelectScene0"
      size="large"
      style="width: 240px"
      @change="Scene0Change"
    >
      <el-option v-for="(item, idx) in scene0IdxCount" :value="item" />
    </el-select>

    <span class="ml-10">{{ sectionDesc }}</span>
    <el-button
      v-if="conversationData.length"
      class="ml-10"
      type="primary"
      @click="downloadSelection('hca')"
      >download hca</el-button
    >
    <el-button
      v-if="conversationData.length"
      class="ml-10"
      type="primary"
      @click="downloadSelection('wav')"
      >download wav</el-button
    >
    <span class="ml-10" v-if="selectionCount"
      >{{ selectionCount }} record(s)</span
    >

    <el-tabs @tab-click="conversationChange">
      <el-tab-pane
        v-for="(item, idx) in conversationIdxCount"
        :label="item"
      ></el-tab-pane>
    </el-tabs>

    <el-table
      v-if="conversationData.length"
      :data="conversationData"
      @selection-change="selectionChange"
      @row-click="rowClick"
      ref="list"
      stripe
      height="680"
    >
      <el-table-column type="selection" fixed />
      <el-table-column label="文件名" fixed width="260">
        <template #default="scope">
          <div @click="fileClick(scope)" class="file">
            {{ scope.row.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="" fixed width="360">
        <template #default="scope">
          <div>
            <audio
              controls
              autoplay
              :src="audioList[scope.$index]"
              :title="scope.row.name + '.wav'"
            ></audio>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="character" label="角色" />
      <el-table-column prop="ori" label="原文" />
      <el-table-column prop="chs" label="中文" />
      <el-table-column prop="eng" label="英文" />
      <el-table-column prop="otherLanguage" label="其他语言" />
      <el-table-column prop="remark" label="备注" />
    </el-table>
  </div>
</template>

<script>
import * as hcaStrUtil from "../utils/hcaStr";
import * as commonApi from "../api/common.js";
import JSZip from "jszip";
import FileSaver from "file-saver";
export default {
  data() {
    return {
      soundNative: {},
      category: "",
      categoryData: null, // {}
      section: "",
      sectionData: [],
      Scene0Section: "",
      scene0IdxCount: null, // {}
      conversationIdxCount: [],
      conversationIdx: 0,
      conversationData: [],
      audioList: [],
      currentClickIdx: -1,

      sectionDesc: "",
      selectionCount: 0,

      hcaJsUrl: new URL(hcaStrUtil.hcaStr, document.baseURI),
      hcaKey1: "0x01395C51",
      hcaKey2: "0x00000000",
      hcaMode: 16,
      hcaLoopCount: 0,
      hcaVolume: 100,
    };
  },
  created() {
    this.getSoundNative();
    // console.log(JSON.parse(JSON.stringify()));
  },
  methods: {
    rowClick(row, column, event) {
      let _this = this;
      _this.$refs["list"].toggleRowSelection(row, undefined);
    },
    selectionChange(list) {
      let _this = this;
      _this.selectionCount = list.length;
    },
    downloadSelection(downloadType) {
      let _this = this;

      let list = _this.$refs["list"].getSelectionRows();

      let filePath = "";
      if (_this.category == "fullvoice") {
        filePath = _this.category + "/" + _this.section + "/";
      }
      if (_this.category == "bgm" || _this.category == "voice") {
        filePath = _this.category + "/";
      }

      if (list.length <= 8) {
        let a = document.createElement("a");
        list.forEach((item) => {
          commonApi.getFile(filePath + item.name).then(async (res) => {
            if (downloadType == "hca") {
              a.href = window.URL.createObjectURL(new Blob([res.data]));
              a.setAttribute("download", item.name);
            }
            if (downloadType == "wav") {
              a.href = window.URL.createObjectURL(
                new Blob([await _this.decryptAndDecode(res.data)])
              );
              a.setAttribute("download", item.name + ".wav");
            }
            a.click();
          });
        });
      }
      if (list.length > 8) {
        let zip = new JSZip();
        let files = [];
        list.forEach((item) => {
          let file = commonApi.getFile(filePath + item.name).then((res) => {
            if (downloadType == "hca") {
              zip.file(item.name, res.data, { binary: true });
            }
            if (downloadType == "wav") {
              zip.file(item.name + ".wav", _this.decryptAndDecode(res.data), {
                binary: true,
              });
            }
          });
          files.push(file);
        });
        Promise.all(files).then(() => {
          zip
            .generateAsync({
              type: "blob",
              compression: "DEFLATE",
              compressionOptions: {
                level: 1,
              },
            })
            .then((res) => {
              FileSaver.saveAs(
                res,
                _this.category + "_" + _this.section + ".zip"
              );
            });
        });
      }
    },

    catrgoryChange(tab, event) {
      let _this = this;
      _this.audioList = [];
      _this.section = "";
      _this.conversationData = [];
      _this.conversationIdxCount = [];
      _this.sectionDesc = "";

      _this.category = tab.props.label;
      _this.categoryData = _this.soundNative[_this.category];
    },
    sectionChange(tab, event) {
      let _this = this;
      _this.audioList = [];
      _this.conversationIdxCount = [];
      _this.conversationData = [];

      _this.Scene0Section = "";
      _this.scene0IdxCount = null;

      _this.section = tab;
      _this.sectionData = _this.categoryData[_this.section];
      if (_this.category == "bgm") {
        _this.conversationData = _this.sectionData;
        return;
      }
      if (_this.category == "fullvoice") {
        let IdxCount = [];
        _this.sectionData.forEach((item) => {
          let Idx;
          let section = parseInt(_this.section.split("_")[1]);
          if (section < 104200) {
            Idx = item.name.split("-")[1];
          }
          if (section > 104200) {
            Idx = item.name.split("-")[0];
          }
          if (!IdxCount.includes(Idx)) {
            IdxCount.push(Idx);
          }
        });

        if (_this.section.split("_")[1] < 104200) {
          _this.conversationIdxCount = IdxCount;
        }
        if (_this.section.split("_")[1] > 104200) {
          _this.scene0IdxCount = IdxCount;
        }
        _this.handleSectionDesc(tab);
        return;
      }
      if (_this.category == "voice") {
        _this.conversationData = _this.sectionData;
        return;
      }
      return;

      _this.section = tab.props.label;
      _this.sectionData = _this.categoryData[_this.section];
      _this.sectionData.forEach((item) => {
        let conversationIdx = item.name.split("-")[1];
        if (!_this.conversationIdxCount.includes(conversationIdx)) {
          _this.conversationIdxCount.push(conversationIdx);
        }
      });
    },
    Scene0Change(tab, event) {
      let _this = this;
      _this.audioList = [];
      _this.conversationData = [];

      _this.Scene0Section = tab;
      let arr = _this.categoryData[_this.section].filter((item) => {
        return item.name.split("-")[0] == _this.Scene0Section;
      });
      let IdxCount = [];
      arr.forEach((item) => {
        let Idx = item.name.split("-")[1];
        if (!IdxCount.includes(Idx)) {
          IdxCount.push(Idx);
        }
      });
      _this.conversationIdxCount = IdxCount;
    },
    conversationChange(tab, event) {
      let _this = this;
      _this.audioList = [];

      _this.conversationIdx = tab.props.label;
      let section = parseInt(_this.section.split("_")[1]);
      _this.conversationData = _this.sectionData.filter((item) => {
        return item.name.split("-")[1] == _this.conversationIdx;
      });
      if (section > 104200) {
        _this.conversationData = _this.conversationData.filter((item) => {
          return item.name.split("-")[0] == _this.Scene0Section;
        });
      }
    },
    fileClick(scope) {
      let _this = this;
      if (scope.$index == _this.currentClickIdx) {
        return;
      }
      _this.currentClickIdx = scope.$index;
      let filePath = "";
      if (_this.category == "fullvoice") {
        filePath = _this.category + "/" + _this.section + "/" + scope.row.name;
      }
      if (_this.category == "bgm" || _this.category == "voice") {
        filePath = _this.category + "/" + scope.row.name;
      }
      _this.getFile(filePath);
    },
    handleSectionDesc(section) {
      let _this = this;

      section = section.split("_");
      if (section[2]) {
        _this.sectionDesc = "other";
        return;
      }

      section = section[1]; // 101101
      let chapter = section[2] + section[3];
      let conversation = section[4] + section[5];
      chapter = parseInt(chapter);
      if (chapter != 0) {
        chapter -= 10;
      }

      if (section < 102100) {
        _this.sectionDesc =
          "arc 1 " + "chapter " + chapter + " section " + conversation;
      }
      if (section > 102100) {
        chapter -= 11;
        _this.sectionDesc =
          "arc 2 " + "chapter " + chapter + " section " + conversation;
      }
      if (section > 104200) {
        _this.sectionDesc = "scene 0";
      }
    },

    getSoundNative() {
      let _this = this;
      commonApi.getList().then((res) => {
        _this.soundNative = res.data;
      });
    },
    async getFile(path) {
      let _this = this;
      let res = await fetch("http://127.0.0.1:16168/getFile/" + path);
      _this.decryptAndDecode(res);
    },
    async decryptAndDecode(hca) {
      let _this = this;
      let res = await fetch(_this.hcaJsUrl.href);
      let blob = new Blob([await res.arrayBuffer()], {
        type: "text/javascript",
      });
      let hcaJsObjUrl = URL.createObjectURL(blob);
      let hcaJsModule = await import(/* @vite-ignore */ hcaJsObjUrl);
      let HCAWorker = hcaJsModule.HCAWorker;
      let worker = await HCAWorker.create(hcaJsObjUrl);

      let ab = await hca.arrayBuffer();
      let buffer = new Uint8Array(ab);

      let decrypted = await worker.decrypt(
        buffer.slice(0),
        _this.hcaKey1,
        _this.hcaKey2
      );
      let wav = await worker.decode(
        decrypted,
        _this.hcaMode,
        _this.hcaLoopCount,
        _this.hcaVolume
      );
      await worker.shutdown();

      let wavObj = new Blob([wav], { type: "audio/x-wav" });
      let tmpUrl = URL.createObjectURL(wavObj);

      _this.audioList[_this.currentClickIdx] = tmpUrl;

      return wavObj;
    },
  },
};
</script>

<style lang="scss" scoped>
.ml-10 {
  margin-left: 10px;
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
</style>
