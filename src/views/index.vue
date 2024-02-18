<template>
  <div class="index"></div>
</template>

<script>
import * as commonApi from "../api/common.js";
import { hcaStr } from "../utils/hcaStr";
export default {
  data() {
    return {
      soundNative: {},

      hcaJsUrl: new URL(hcaStr, document.baseURI),
    };
  },
  created() {
    this.getSoundNative();
  },
  methods: {
    getSoundNative() {
      let that = this;
      commonApi.getList().then((res) => {
        that.soundNative = res.data
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
