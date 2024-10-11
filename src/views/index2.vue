<template>
  <div class="index">
    <div class="flex-left">
      <div>
        <span>key1=</span><input type="text" v-model="hcaKey1" />
        <span class="ml-10">key2=</span><input type="text" v-model="hcaKey2" />
        <br />
        <span>decoding mode: </span
        ><input type="number" step="8" min="0" max="32" v-model="hcaMode" />
        <span class="ml-10">loop count: </span
        ><input
          type="number"
          step="1"
          min="0"
          max="99"
          v-model="hcaLoopCount"
        />
        <span class="ml-10">volume: </span
        ><input type="number" step="1" min="0" max="100" v-model="hcaVolume" />
      </div>
      <div class="ml-10">
        <el-button
          type="danger"
          v-if="editMode == false"
          @click="editMode = true"
          >enable edit mode</el-button
        >
        <el-button
          type="warning"
          v-if="editMode == true"
          @click="editMode = false"
          >disable edit mode</el-button
        >
        <el-button type="primary" v-if="editMode" @click="updateDB()"
          >update</el-button
        >
      </div>
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
      <!-- <el-option v-for="(category, item, idx) in categoryData" :value="item" /> -->
      <el-option v-for="(item, idx) in categoryData" :value="item" />
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
      v-if="tableData.length"
      class="ml-10"
      type="primary"
      @click="downloadSelection('hca')"
      >download hca</el-button
    >
    <el-button
      v-if="tableData.length"
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

    <el-table-v2
      :width="1800"
      :height="680"
      :estimated-row-height="120"
      :row-class="rowClass"
      fixed
      v-if="tableData.length"
      :data="tableData"
      :columns="tableColumns"
    />

    <el-drawer v-model="confirmDrawer" direction="rtl" size="90%">
      <template #header> </template>
      <template #default>
        <el-table-v2
          :width="1660"
          :height="680"
          :estimated-row-height="120"
          :row-class="rowClass"
          fixed
          v-if="listPre.length"
          :data="listPre"
          :columns="listPreColumns"
        />
      </template>
      <template #footer>
        <el-button type="danger" @click="doUpdateDB()">update</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="jsx">
import { h } from "vue";
import * as hcaStrUtil from "../utils/hcaStr";
import * as config from "../utils/config";
import * as commonApi from "../api/common.js";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { ElCheckbox } from "element-plus";
import _ from "lodash";
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

      editMode: false,
      confirmDrawer: false,
      listPre: [],

      hcaJsUrl: new URL(hcaStrUtil.hcaStr, document.baseURI),
      hcaKey1: "0x01395C51",
      hcaKey2: "0x00000000",
      hcaMode: 16,
      hcaLoopCount: 0,
      hcaVolume: 100,

      tableDataSelectColumn: {
        // key: "selection",
        fixed: true,
        width: 40,
        // cellRenderer: (cellData) => {
        //   const onChange = (val) => (cellData.rowData.checked = val);
        //   return (
        //     <SelectionCell
        //       value={cellData.rowData.checked}
        //       onChange={onChange}
        //     />
        //   );
        // },
        headerCellRenderer: () => {
          const _data = this.tableData;
          const allSelected = _data.every((row) => row.selected);
          const containsSelected = _data.some((row) => row.selected);
          const onChange = (value) => {
            _data.map((row) => {
              row.selected = value;
              return row;
            });
          };

          return (
            // <ElCheckbox
            //   value={allSelected}
            //   intermediate={containsSelected && !allSelected}
            //   onChange={onChange}
            // />
            h(ElCheckbox, {
              modelValue: allSelected,
              indeterminate: containsSelected && !allSelected,
              onChange,
            })
          );
        },
        cellRenderer: (cellData) =>
          h(ElCheckbox, {
            modelValue: this.tableData[cellData.rowIndex].selected,
            "onUpdate:modelValue": () =>
              (this.tableData[cellData.rowIndex].selected =
                !this.tableData[cellData.rowIndex].selected),
            onChange: (val) => {
              // this.tableData[cellData.rowIndex].selected = this.tableData[cellData.rowIndex].selected;
              // console.log(JSON.parse(JSON.stringify(this.tableData)));
            },
          }),
      },
      listPreSelectColumn: {
        fixed: true,
        width: 40,
        headerCellRenderer: () => {
          const _data = this.listPre;
          const allSelected = _data.every((row) => row.selected);
          const containsSelected = _data.some((row) => row.selected);
          const onChange = (value) => {
            _data.map((row) => {
              row.selected = value;
              return row;
            });
          };

          return h(ElCheckbox, {
            modelValue: allSelected,
            indeterminate: containsSelected && !allSelected,
            onChange,
          });
        },
        cellRenderer: (cellData) =>
          h(ElCheckbox, {
            modelValue: this.listPre[cellData.rowIndex].selected,
            "onUpdate:modelValue": () =>
              (this.listPre[cellData.rowIndex].selected =
                !this.listPre[cellData.rowIndex].selected),
          }),
      },
      fullColumns: [
        {
          key: "file_name",
          dataKey: "file_name",
          title: "file_name",
          fixed: true,
          width: 260,
          cellRenderer: (cellData) => (
            <div class="file" onClick={() => this.fileClick(cellData)}>
              {cellData.rowData.file_name}
            </div>
          ),
        },
        {
          key: "",
          dataKey: "",
          title: "",
          fixed: true,
          width: 360,
          cellRenderer: (cellData) => (
            <audio
              controls
              autoplay
              src={this.audioList[cellData.rowIndex]}
              title={cellData.rowData.file_name + ".wav"}
            />
          ),
        },
        {
          key: "character",
          dataKey: "character",
          title: "character",
          width: 160,
          cellRenderer: (cellData) => (
            <>
              {this.editMode ? (
                <el-input
                  type="textarea"
                  autosize
                  v-model={cellData.rowData.character}
                ></el-input>
              ) : (
                <div>{cellData.rowData.character}</div>
              )}
            </>
          ),
        },
        {
          key: "ori",
          dataKey: "ori",
          title: "ori",
          width: 200,
          cellRenderer: (cellData) => (
            <>
              {this.editMode ? (
                <el-input
                  type="textarea"
                  autosize
                  v-model={cellData.rowData.ori}
                ></el-input>
              ) : (
                <div>{cellData.rowData.ori}</div>
              )}
            </>
          ),
        },
        {
          key: "chs",
          dataKey: "chs",
          title: "chs",
          width: 200,
          cellRenderer: (cellData) => (
            <>
              {this.editMode ? (
                <el-input
                  type="textarea"
                  autosize
                  v-model={cellData.rowData.chs}
                ></el-input>
              ) : (
                <div>{cellData.rowData.chs}</div>
              )}
            </>
          ),
        },
        {
          key: "eng",
          dataKey: "eng",
          title: "eng",
          width: 200,
          cellRenderer: (cellData) => (
            <>
              {this.editMode ? (
                <el-input
                  type="textarea"
                  autosize
                  v-model={cellData.rowData.eng}
                ></el-input>
              ) : (
                <div>{cellData.rowData.eng}</div>
              )}
            </>
          ),
        },
        {
          key: "other_language",
          dataKey: "other_language",
          title: "other_language",
          width: 200,
          cellRenderer: (cellData) => (
            <>
              {this.editMode ? (
                <el-input
                  type="textarea"
                  autosize
                  v-model={cellData.rowData.other_language}
                ></el-input>
              ) : (
                <div>{cellData.rowData.other_language}</div>
              )}
            </>
          ),
        },
        {
          key: "remark",
          dataKey: "remark",
          title: "remark",
          width: 200,
          cellRenderer: (cellData) => (
            <>
              {this.editMode ? (
                <el-input
                  type="textarea"
                  autosize
                  v-model={cellData.rowData.remark}
                ></el-input>
              ) : (
                <div>{cellData.rowData.remark}</div>
              )}
            </>
          ),
        },
      ],
      tableColumns: [],
      listPreColumns: [],
      tableData: [],
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

      // let list = _this.$refs["list"].getSelectionRows();
      let list = _this.tableData.filter((item) => {
        return item.selected == true;
      });
      if (!list.length) {
        ElNotification({
          title: "提示",
          message: "无数据",
        });
        return;
      }

      let filePath = "";
      if (_this.category == "fullvoice") {
        filePath = _this.category + "/" + _this.section + "/";
      }
      if (_this.category == "bgm" || _this.category == "voice") {
        filePath = _this.category + "/";
      }

      let zip = new JSZip();
      let files = [];
      list.forEach((item) => {
        let file = commonApi.getFile(filePath + item.file_name).then((res) => {
          if (downloadType == "hca") {
            zip.file(item.file_name, res.data, { binary: true });
          }
          if (downloadType == "wav") {
            zip.file(
              item.file_name + ".wav",
              _this.decryptAndDecode(res.data),
              {
                binary: true,
              }
            );
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
    },

    updateDB() {
      let _this = this;

      _this.listPre = _.cloneDeep(_this.tableData);
      _this.listPre = _this.listPre.filter((item) => {
        return item.selected == true;
      });
      if (!_this.listPre.length) {
        ElNotification({
          title: "提示",
          message: "无数据",
        });
        return;
      }

      _this.listPre.forEach((item) => {
        item.selected = false;
      });
      _this.confirmDrawer = true;
      return;

      if (_this.$refs["list"] == undefined) {
        ElNotification({
          title: "提示",
          message: "无数据",
        });
        return;
      }

      _this.listPre = _this.$refs["list"].getSelectionRows();
      if (!_this.listPre.length) {
        ElNotification({
          title: "提示",
          message: "无数据",
        });
        return;
      }

      _this.confirmDrawer = true;
    },
    doUpdateDB() {
      let _this = this;

      let listSend = _this.listPre.filter((item) => {
        return item.selected == true;
      });

      if (!listSend.length) {
        ElNotification({
          title: "提示",
          message: "无数据",
        });
        return;
      }

      if (_this.category == "bgm") {
        commonApi.updateBgm(listSend);
      }
      if (_this.category == "fullvoice") {
        commonApi.updateFullvoice(listSend);
      }
      if (_this.category == "voice") {
        commonApi.updateVoice(listSend);
      }
      _this.confirmDrawer = false;
      _this.editMode = false;
    },

    catrgoryChange(tab, event) {
      let _this = this;
      _this.section = "";
      _this.sectionDesc = "";
      _this.conversationIdxCount = [];
      // _this.conversationData = [];
      _this.tableData = [];
      _this.audioList = [];
      _this.listPre = [];
      _this.selectionCount = 0;

      _this.category = tab.props.label;
      _this.categoryData = _this.soundNative[_this.category];

      let t = _.cloneDeep(_this.fullColumns);

      t.unshift(_this.tableDataSelectColumn);
      _this.tableColumns = _.cloneDeep(t);

      t.shift();
      t.unshift(_this.listPreSelectColumn);
      _this.listPreColumns = _.cloneDeep(t);
      // _this.tableColumns = _.cloneDeep(
      //   _this.fullColumns.unshift(_this.tableDataSelectColumn)
      // );
      // _this.listPreColumns = _.cloneDeep(
      //   _this.fullColumns.unshift(_this.listPreSelectColumn)
      // );
      if (_this.category == "bgm") {
        _this.tableColumns.splice(3, 5);
        _this.listPreColumns.splice(3, 5);
      }
      if (_this.category == "voice") {
        _this.tableColumns.splice(3, 1);
        _this.listPreColumns.splice(3, 1);
      }
    },
    async sectionChange(tab, event) {
      let _this = this;
      _this.conversationIdxCount = [];
      // _this.conversationData = [];
      _this.tableData = [];
      _this.audioList = [];
      _this.listPre = [];
      _this.selectionCount = 0;

      _this.Scene0Section = "";
      _this.scene0IdxCount = null;

      _this.section = tab;
      // _this.sectionData = _this.categoryData[_this.section];

      if (_this.category == "bgm") {
        await commonApi.getListBgm(_this.section).then((res) => {
          // _this.conversationData = res.data;
          _this.tableData = res.data;
        });
      }
      if (_this.category == "fullvoice") {
        await commonApi.getListFullvoice(_this.section).then((res) => {
          _this.sectionData = res.data;
          let IdxCount = [];
          _this.sectionData.forEach((item) => {
            let Idx;
            let section = parseInt(_this.section.split("_")[1]);
            if (section < 104200) {
              Idx = item.file_name.split("-")[1];
            }
            if (section > 104200) {
              Idx = item.file_name.split("-")[0];
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
        });
      }
      if (_this.category == "voice") {
        await commonApi.getListVoice(_this.section).then((res) => {
          // _this.conversationData = res.data;
          _this.tableData = res.data;
        });
      }
      return;

      _this.section = tab.props.label;
      _this.sectionData = _this.categoryData[_this.section];
      _this.sectionData.forEach((item) => {
        let conversationIdx = item.file_name.split("-")[1];
        if (!_this.conversationIdxCount.includes(conversationIdx)) {
          _this.conversationIdxCount.push(conversationIdx);
        }
      });
    },
    Scene0Change(tab, event) {
      let _this = this;
      // _this.conversationData = [];
      _this.tableData = [];
      _this.audioList = [];
      _this.listPre = [];
      _this.selectionCount = 0;

      _this.Scene0Section = tab;

      // let arr = _this.categoryData[_this.section].filter((item) => {
      let arr = _this.sectionData.filter((item) => {
        return item.file_name.split("-")[0] == _this.Scene0Section;
      });
      let IdxCount = [];
      arr.forEach((item) => {
        let Idx = item.file_name.split("-")[1];
        if (!IdxCount.includes(Idx)) {
          IdxCount.push(Idx);
        }
      });
      _this.conversationIdxCount = IdxCount;
    },
    conversationChange(tab, event) {
      let _this = this;
      _this.audioList = [];
      _this.listPre = [];

      _this.conversationIdx = tab.props.label;
      let section = parseInt(_this.section.split("_")[1]);
      // _this.conversationData = _this.sectionData.filter((item) => {
      _this.tableData = _this.sectionData.filter((item) => {
        return item.file_name.split("-")[1] == _this.conversationIdx;
      });
      if (section > 104200) {
        // _this.conversationData = _this.sectionData.filter((item) => {
        _this.tableData = _this.tableData.filter((item) => {
          return item.file_name.split("-")[0] == _this.Scene0Section;
        });
      }
      _this.tableData.forEach((item, idx) => {
        _this.tableData[idx].selected = false;
      });
    },
    fileClick(cellData) {
      let _this = this;
      if (cellData.rowIndex == _this.currentClickIdx) {
        return;
      }
      _this.currentClickIdx = cellData.rowIndex;
      if (_this.category == "fullvoice") {
        _this.getFile(
          _this.category +
            "/" +
            _this.section +
            "/" +
            cellData.rowData.file_name
        );
      }
      if (_this.category == "bgm" || _this.category == "voice") {
        _this.getFile(_this.category + "/" + cellData.rowData.file_name);
      }

      return;
      if (scope.$index == _this.currentClickIdx) {
        return;
      }
      _this.currentClickIdx = scope.$index;
      if (_this.category == "fullvoice") {
        _this.getFile(
          _this.category + "/" + _this.section + "/" + scope.row.file_name
        );
      }
      if (_this.category == "bgm" || _this.category == "voice") {
        _this.getFile(_this.category + "/" + scope.row.file_name);
      }
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
      // commonApi.getList().then((res) => {
      //   _this.soundNative = res.data;
      // });
      commonApi.getListBrief().then((res) => {
        _this.soundNative = res.data;
      });
    },
    async getFile(path) {
      let _this = this;
      let res = await fetch(config.baseUrl + "/getFile/" + path);
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

    rowClass(row) {
      if (row.rowIndex % 2 === 1) {
        return "stripe";
      }
      return "";
    },
  },
};
</script>

<style>
.stripe {
  background: #fafafa;
}

.ml-10 {
  margin-left: 10px;
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
</style>
