<template>
  <div class="index">
    <el-tabs v-model="activeTabName" @tab-click="tabClick">
      <el-tab-pane
        v-for="(chapter, index) in list"
        :label="index"
        :name="index"
      >
        <!-- <div
          v-for="(item, index2) in listDetail"
          @click="fileClick(index + '/' + item.name)"
          class="flex-left"
        >
          <span class="pd-10"> {{ index2 }}</span>
          <span class="pd-10"> {{ item.name }}</span>
          <span class="pd-10">
            <audio controls :src="audioFiles[index2]"></audio
          ></span>
          <span class="pd-10"> {{ item.character }}</span>
        </div> -->
        <el-table ref="chapterDetail" :data="chapter">
          <el-table-column type="selection" />
          <!-- <el-table-column property="name" label="文件名" @click="" /> -->
          <el-table-column label="文件名">
            <template #default="scope">
              <div @click="fileClick(scope)">{{ scope.row.name }}</div>
            </template>
          </el-table-column>
          <!-- <audio controls :src="audioFiles[0]"></audio> -->
          <el-table-column label="播放">
            <template #default="scope">
              <audio controls :src="audioFiles[scope.$index]"></audio>
            </template>
          </el-table-column>
          <el-table-column property="character" label="角色" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as commonApi from "../api/common.js";
import { hcaStr } from "../utils/hcaStr";
export default {
  data() {
    return {
      list: [],
      activeTabName: "",
      audioFiles: [],
      currentClick: -1,

      hcaJsUrl: new URL(hcaStr, document.baseURI),
    };
  },
  created() {
    this.getList();
  },
  methods: {
    fileClick(scope) {
      let that = this;
      that.currentClick = scope.$index;
      that.getFile(that.activeTabName + "/" + scope.row.name);
    },
    tabClick(tab, event) {
      let that = this;
      setTimeout(() => {
        let chapterLength = that.list[that.activeTabName].length;
        that.audioFiles = [];
        for (let i = 0; i < chapterLength; i++) {
          that.audioFiles.push("");
        }
      }, 10);
    },
    getList() {
      let that = this;
      commonApi.getList().then((res) => {
        that.list = res.data;
        // that.activeTabName = Object.keys(res.data)[0]
      });
    },
    async getFile(path) {
      let that = this;
      let res = await fetch("http://127.0.0.1:16168/getFile/" + path);
      that.decryptAndDecode(res);
    },
    async decryptAndDecode(hca) {
      let that = this;
      let res = await fetch(that.hcaJsUrl.href);
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
        "0x01395C51",
        "0x00000000"
      );
      let wav = await worker.decode(decrypted, 16);
      await worker.shutdown();

      let tmpUrl = URL.createObjectURL(
        new Blob([wav], { type: "audio/x-wav" })
      );

      that.audioFiles[that.currentClick] = tmpUrl;
    },
  },
};
</script>

<style lang="scss" scoped>
.flex-left {
  display: flex;
  justify-content: left;
  align-items: center;
}

.pd-10 {
  padding: 10px;
}
</style>
