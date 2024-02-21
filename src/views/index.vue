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

    <el-tabs @tab-click="sectionChange">
      <el-tab-pane
        v-for="(category, item, idx) in categoryData"
        :label="item"
      ></el-tab-pane>
    </el-tabs>

    <el-tabs @tab-click="conversationChange">
      <el-tab-pane
        v-for="(category, item, idx) in conversationIdxCount"
        :label="item + 1"
      ></el-tab-pane>
    </el-tabs>

    <el-table
      v-if="conversationData.length"
      :data="conversationData"
      stripe
      height="770"
    >
      <el-table-column type="selection" fixed />
      <el-table-column label="文件名" fixed width="260">
        <template #default="scope">
          <div @click="fileClick(scope)">
            {{ scope.row.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="" fixed width="360">
        <template #default="scope">
          <div>
            <audio
              controls
              :src="audioList[scope.$index]"
              :title="scope.row.name + '.wav'"
            ></audio>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="character" label="角色" />
      <el-table-column prop="ori" label="原文" />
      <el-table-column prop="chs" label="中文" />
      <el-table-column prop="eng" label="英语" />
      <el-table-column prop="otherLanguage" label="其他语言" />
      <el-table-column prop="remark" label="备注" />
    </el-table>
  </div>
</template>

<script>
import * as commonApi from "../api/common.js";
import { hcaStr } from "../utils/hcaStr";
export default {
  data() {
    return {
      soundNative: {},
      category: "",
      categoryData: {},
      section: "",
      sectionData: [],
      conversationIdxCount: [],
      conversationIdx: 0,
      conversationData: [],
      audioList: [],
      currentClickIdx: -1,

      hcaJsUrl: new URL(hcaStr, document.baseURI),
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
    catrgoryChange(tab, event) {
      let _this = this;
      _this.audioList = [];
      _this.conversationData = [];
      _this.conversationIdxCount = [];

      _this.category = tab.props.label;
      _this.categoryData = _this.soundNative[_this.category];
    },
    sectionChange(tab, event) {
      let _this = this;
      _this.audioList = [];
      _this.conversationData = [];

      _this.section = tab.props.label;
      _this.sectionData = _this.categoryData[_this.section];
      _this.sectionData.forEach((item) => {
        let conversationIdx = item.name.split("-")[1];
        console.log(conversationIdx);
        if (!_this.conversationIdxCount.includes(conversationIdx)) {
          _this.conversationIdxCount.push(conversationIdx);
        }
      });
    },
    conversationChange(tab, event) {
      let _this = this;
      _this.audioList = [];

      _this.conversationIdx = tab.props.label;
      _this.conversationData = _this.sectionData.filter((item) => {
        return item.name.split("-")[1] == _this.conversationIdx;
      });
    },
    fileClick(scope) {
      let _this = this;
      _this.currentClickIdx = scope.$index;
      _this.getFile(_this.section + "/" + scope.row.name);
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
      let hcaJsModule = await import(hcaJsObjUrl);
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

      let tmpUrl = URL.createObjectURL(
        new Blob([wav], { type: "audio/x-wav" })
      );

      _this.audioList[_this.currentClickIdx] = tmpUrl;
    },
  },
};
</script>

<style lang="scss" scoped>
.ml-10 {
  margin-left: 10px;
}
</style>
