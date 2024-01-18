<template>
  <div class="index">
    <el-tabs v-model="activeTabName" @tab-click="tabClick">
      <el-tab-pane
        v-for="(listDetail, index) in list"
        :label="index"
        :name="index"
      >
        <div
          v-for="(item, index2) in listDetail"
          @click="fileClick(index + '/' + item.name)"
          class="flex-left"
        >
          <span class="pd-10"> {{ index2 }}</span>
          <span class="pd-10"> {{ item.name }}</span>
          <span class="pd-10"> <audio controls :src="audioFile"></audio></span>
          <span class="pd-10"> {{ item.character }}</span>
        </div>
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
      audioFile: "",
      fileName: "",

      hcaJsUrl: new URL(hcaStr, document.baseURI),
    };
  },
  created() {
    this.getList();
  },
  methods: {
    fileClick(path) {
      let that = this;
      that.getFile(path);
    },
    tabClick(tab, event) {
      let that = this;
    },
    getList() {
      let that = this;
      commonApi.getList().then((res) => {
        that.list = res.data;
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

      that.audioFile = tmpUrl;
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
