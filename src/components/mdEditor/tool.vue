<template>
    <ul class="markdown-toolbars">
        <li class="tools_title">WK编辑器</li>
        <li  :name="item.tip" v-for="item in data" >
            <WIcon  :name="item.name"  class="iconfont" @click="()=>command({action:item.action})"></WIcon>
        </li>
        <li  :name="item.tip" v-for="item in title" >
            <i style="font-size: 16px;" @click="()=>command({action:item.action,level:item.level})" >{{item.name}}</i>
        </li>
        <li  :name="item.tip" v-for="item in other" >
            <WIcon  :name="item.name"  class="iconfont" @click="()=>command({action:item.action})"></WIcon>
        </li>
        <li  name="本地图片" >
            <WIcon  name="fa-file-image-o"  class="iconfont" @click="chooseImage"></WIcon>
        </li>
        <li  :name="item.tip" v-for="item in alertDataList" >
            <WIcon  :name="item.name"  class="iconfont" @click="()=>alertChange({atrr:item.attr,value:item.value})"></WIcon>
        </li>
        <li  :name="item.tip" v-for="item in attr" >
            <WIcon  :name="item.name"  class="iconfont" @click="()=>attrChange({atrr:item.attr,value:item.value})"></WIcon>
        </li>
        <li  name="导入MD文件"  >
            <WIcon  name="fa-file-text-o"  class="iconfont" @click="selectFileMd"></WIcon>
            <input
                     v-show="false"
                    type="file"
                     ref="mdInputRef"
                    @change="importMd($event)"
                    accept="text/markdown"
            />
        </li>
        <li  name="导入word" >
            <WIcon  name="fa-file-word-o"  class="iconfont" @click="onSupport"></WIcon>
            <input
                    v-show="false"
                    type="file"
            />
        </li>
        <li  name="解析html" >
            <WIcon  name="fa-html5"  class="iconfont" @click="onSupport"></WIcon>
        </li>

        <li :name='scrollTip'>
            <WIcon name="fa-toggle-on" v-if="editorToolsAttr.scrolling" class="iconfont"   @click="()=>attrChange({atrr:'scrolling',value:false})" ></WIcon>
            <WIcon name="fa-toggle-off" v-else class="iconfont"  @click="()=>attrChange({atrr:'scrolling',value:true})"></WIcon>
        </li>
        <li   class="download">
            <WIcon name="fa-download" class="iconfont"></WIcon>
            <ul class="hover_show">
                <li @click="()=>command({action:'exportFile'})" >
                    <WIcon name="fa-file-o" class="iconfont" style="display:inline;margin-right:10px"></WIcon>
                    导出 Markdown
                </li>
                <li  @click="onSupport">
                    <WIcon name="fa-file-pdf-o" class="iconfont" style="display:inline;margin-right:10px"></WIcon>
                    导出 pdf
                </li>
            </ul>
        </li>
        <li class="empty"></li>
        <li  name="退出全屏" v-if="editorToolsAttr.fullscreen">
            <WIcon name="fa-window-close-o" class="iconfont"  @click="()=>attrChange({atrr:'fullscreen',value:false})"></WIcon>
        </li>
        <li  name="全屏" v-else>
            <WIcon name="fa-arrows-alt" class="iconfont"  @click="()=>attrChange({atrr:'fullscreen',value:true})"> </WIcon>
        </li>
    </ul>
    <el-dialog  v-model="alertData.tableShow" title="生成表格" :append-to-body="true" width="1000px">
      <div  style="padding:0 5px" >
        <span style="margin-right:20px;font-weight: bold;margin-bottom:20px;top:-20px;position: relative">设置单元格数</span>
      <div  class="table_dialog_item" >
        <div class="algin">
          <strong>对齐方式</strong>
          <label >
            <WIcon name="fa-align-right"></WIcon>
            <input type="radio" v-model="tableAttr.align"  value="right">
          </label>
          <label>
            <WIcon name="fa-align-center"></WIcon>
            <input type="radio" v-model="tableAttr.align"  value="center">
          </label>
          <label >
            <WIcon name="fa-align-left"></WIcon>
            <input type="radio" v-model="tableAttr.align"  value="left">
          </label>
          <label>
            <WIcon name="fa-align-justify"></WIcon>
            <input type="radio" v-model="tableAttr.align" value="default">
          </label>
        </div>
        行数
        <el-input-number  v-model="tableAttr.row" label="行数" size="mini" controls-position="right" style="margin:0 10px"/>
        列数
        <el-input-number  v-model="tableAttr.col" label="列数" size="mini" controls-position="right" style="margin:0 10px" />

        <el-button type="primary" @click="setData" style="margin:0 30px;padding:0 10px" size="small">
          创建表格
        </el-button>
      </div>
      <el-divider style="margin:15px 0;display: block" />
      <div class="table_dialog_table" v-if="tableAttr.tableHeader.length>0&&tableAttr.row>0&&tableAttr.col>0">
        <h4 style="line-height:24px">设置单元格名称</h4>
        <table>
          <tr class="table_body_item" >
            <td class="td"   v-for="(item,i) in tableAttr.tableHeader">
              <el-input v-model="tableAttr.tableHeader[i]" placeholder="请输表头内容"></el-input>
            </td>
          </tr>
        </table>
        <h4 style="line-height:24px">设置单元格内容</h4>
        <table>
          <tr class="table_body_item"  v-for="(item,i) in tableAttr.tableData">
            <td v-for="(value,k) in tableAttr.tableData[i]"  class="td">
              <el-input v-model="tableAttr.tableData[i][k]" placeholder="请输表头内容"></el-input>
            </td>
          </tr>
        </table>
      </div>

    </div>
      <template #footer style="padding:20px 0;text-align: right">
        <el-button @click="tableCancel" style="margin:0 10px;padding:0 10px" size="small">取 消</el-button>
        <el-button type="primary" @click="tableParse" style="margin:0 10px;padding:0 10px" size="small">确 定</el-button>
      </template>
  </el-dialog >
    <el-dialog  v-model="alertData.codeShow" title="生成代码" :append-to-body="true" width="1000px">
    <div  style="padding:0 5px" >
      <h4 class="editormd-code-toolbar">
        <span style="margin-right:20px">代码语言</span>
        <el-select
            v-model="codeDialogLang"
            style="min-width:140px;">
          <el-option :value="item" v-for="(item,index) in langType" :key="index">{{item}}</el-option>
        </el-select>
      </h4>
      <div   class="markdown-content" style="height:420px;border-radius:10px;margin-top:30px;position: relative">
        <div  ref="codeEditorRef" id="codeEditor"  class="codemirror"  ></div>
      </div>

    </div >
      <template #footer style="padding:20px 0;text-align: right">
        <el-button @click="codeCancel" style="margin:0 10px;padding:0 10px" size="small">取 消</el-button>
        <el-button type="primary" @click="codeParse" style="margin:0 10px;padding:0 10px" size="small">确 定</el-button>
      </template>
  </el-dialog >
    <el-dialog  v-model="alertData.sqlShow" title="解析数据库信息" :append-to-body="true" width="1000px">
    <div class="common_dialog">
      <h4>温馨提示：将数据库创建脚本复制到文本框，自动解析生成文档.示例</h4>
      <pre style="margin-top:15px">
      CREATE TABLE `test` (
        `name` varchar(255) DEFAULT NULL,
        `id` int(11) NOT NULL,
        PRIMARY KEY (`id`),
        KEY `a` (`name`,`id`),
        KEY `b` (`id`,`name`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      </pre>
    <div  style="padding:0 5px" >
      <div   class="markdown-content" style="height:420px;border-radius:10px;margin-top:30px;position: relative">
        <div  ref="sqlEditorRef" id="sqlEditor"  class="codemirror"  ></div>
      </div>

    </div >
    </div>
    <template #footer style="padding:20px 0;text-align: right">
      <el-button @click="sqlCancel" style="margin:0 10px;padding:0 10px" size="small">取 消</el-button>
      <el-button type="primary" @click="sqlParse" style="margin:0 10px;padding:0 10px" size="small">确 定</el-button>
    </template>
  </el-dialog >
    <el-dialog   v-model="alertData.linkShow" title="生成超链接"  :append-to-body="true" width="1000px"   >
      <div  >
        <label style="margin-bottom:20px;display: block">链接地址</label>
        <el-input v-model="hrefLink" type="text"  placeholder="请输入链接地址"  />
      </div>
      <div >
        <label style="margin-bottom:20px;margin-top:20px;display: block">链接标题</label>
        <el-input v-model="hrefValue" type="text"  placeholder="请输入链接标题"  />
      </div>
      <template #footer style="padding:20px 0;text-align: right">
        <el-button @click="linkCancel" style="margin:0 10px;padding:0 10px" size="small">取 消</el-button>
        <el-button type="primary" @click="linkParse" style="margin:0 10px;padding:0 10px" size="small">确 定</el-button>
      </template>
    </el-dialog>
</template>

<script lang="ts">

    import WIcon from  "../icon/index.vue"
    import { ElMessage } from 'element-plus'
    import {defineComponent,ref, toRefs, computed, inject, nextTick, reactive, watch} from 'vue'
    import {data,title,other,alertDataList,attr} from "./config/config"
    import {core} from "../../core/core";
    import {renderTable, sqlParse as sqlParseIn} from "./util/render";
    import  {langType} from "./config/langType"
    import {CodeEditor} from "./editor/code";
    import {SqlEditor} from "./editor/sql";
    export default defineComponent({
        name: 'editor_tools',
        components:{
            WIcon
        },
        emits:['on-upload-image','insert','attrChange','alertChange','preview'],
        setup(props,ctx){
          let editor
          core.bus.on("MainEditorReady",(e)=>{
            editor=e
          })

          let editorToolsAttr=inject("editorToolsAttr")

          let scrollTip=computed(()=>{
              return editorToolsAttr.scrolling ? "同步滚动:开" : "同步滚动:关"
          })

          let codeEditor=null
          let sqlEditor=null

          let state=reactive({
            codeDialogLang:"other", //默认语言
            sqlValue:"",
            codeValue:"",
            hrefValue:"",
            hrefLink:"",
            tableAttr:reactive({
              align:"default",
              col:0,
              row:0,
              tableData:reactive([]),
              tableHeader:reactive([])
            }),
            alertData:{
              sqlShow:false, //弹出层 可以删掉吧
              tableShow:false,
              codeShow:false,
              linkShow:false,
            },
          })
          //ref实例
              //code
          let codeEditorRef=ref<HTMLElement>(null)
              //sql
          let sqlEditorRef=ref<HTMLElement>(null)
              //上传md
          let mdInputRef=ref<HTMLElement>(null)



          function onSupport(){
            ElMessage.info({showClose: true, message: '您选择的功能暂未开放'});
          }
          //初始化表格数据
          function  initTable() {
            state.tableAttr.tableHeader=[]
            state.tableAttr.tableData=[]
          }
          //创建表格数据
          function setData() {

            initTable()
            let initTableData=[]
            //根据col row 初始化数据
            for(let i =0;i<state.tableAttr.row;i++){
              initTableData[i]= initTableData[i]||[];
              initTableData[i].length=state.tableAttr.col
              for(let j =0;j<state.tableAttr.col;j++){
                initTableData[i][j]=initTableData[i][j]||''
              }
            }
            for (let i=0;i<state.tableAttr.col;i++){
              state.tableAttr.tableHeader.push("")
            }
            state.tableAttr.tableData=initTableData
          }
          //解析表格
          function tableParse() {
            if(state.tableAttr.col>0&&state.tableAttr.row>0){
              editor.insertContent(renderTable(state.tableAttr.tableHeader,state.tableAttr.tableData,state.tableAttr.align))
              initTable()
              state.tableAttr.col=0
              state.tableAttr.row=0
            }
            state.alertData.tableShow=false
          }
          //关闭表格弹窗
          function tableCancel() {
            if(state.tableAttr.col>0&&state.tableAttr.row>0){
              initTable()
              state.tableAttr.col=0
              state.tableAttr.row=0
            }
            state.alertData.tableShow=false
          }
          //解析超链接
          function  linkParse(){
            if(state.hrefLink==''||state.hrefLink==''){
              return;
            }
            editor.insertContent('\n['+state.hrefValue+']('+state.hrefLink+')'); //插入代码内容
            linkCancel()
          }
          //关闭超链接弹窗
          function  linkCancel(){
            state.hrefLink=''
            state.hrefLink=''
            state.alertData.linkShow=false
          }

          //关闭代码弹窗
          function codeCancel() {
            state.alertData.codeShow=false
          }
          //解析代码
          function codeParse() {
            let lang=''
            if(state.codeValue){
              if( state.codeDialogLang=='other'){
                lang=''
              }else{
                lang=state.codeDialogLang
              }
              editor.insertContent('\n```'+lang+'\n' + state.codeValue + '\n```\n'); //插入代码内容
            }
            codeEditor.setValue('')
            codeCancel()
          }
          //关闭sql弹窗
          function sqlCancel() {
            state.alertData.sqlShow=false
          }
          //解析sql
          function sqlParse() {
            let data=[]
            try {
              data=sqlParseIn(state.sqlValue)
            }catch (e) {
              ElMessage.error({showClose: true, message: '您填写的sql不正确'});
              return false
            }

            if(data&&data[0]&&data[1].length>0){
              let tableHeader=['字段名','类型','NULL','默认值','注释','索引']
              editor.insertContent('\n### 表名:'+data[0]+'\n');
              editor.insertContent(renderTable(tableHeader,data[1],"default"))
            }else{
              ElMessage.error({showClose: true, message: 'sql数据不对'});
              return false
            }
            sqlEditor.setValue('')
            sqlCancel()
          }

          //导入md文件
          function importMd(e) {// 导入本地文件

              const file = e.target.files[0];
              if (!file) {
                  return;
              }
              if(!/^md$/ig.test(file.name.split(".").pop())){
                ElMessage.error({showClose: true, message:"文件格式不对"})
                return;
              }
              const reader = new FileReader();
              reader.readAsText(file, {
                  encoding: "utf-8"
              });
              reader.onload = () => {
                  e.target.value = "";
                  editor.insertContent(reader.result);
              };
              reader.onerror = err => {
                  console.error(err);
              }
          }
            //选择文件
          function selectFileMd() {
            if(editorToolsAttr.preview){
              ElMessage.info({showClose: true, message: "预览模式下不可编辑"});
              return
            }
              mdInputRef.value.click()
          }
            //处理编辑器命令
          function command($event) {
              if( editorToolsAttr.preview){
                ElMessage.info({showClose: true, message: "预览模式下不可编辑"});
                return
              }
              editor[$event.action]($event.level)
          }
            //选择图片
            function chooseImage() {
              if( editorToolsAttr.preview){
                ElMessage.info({showClose: true, message: "预览模式下不可编辑"});
                return
              }
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = ()=>{
                    const files = input.files;
                    if(files[0]){
                        ctx.emit('on-upload-image', files[0]);
                        input.value = '';
                    }
                }
                input.click();
            }
           //code编辑器监听语言变化,设置提示
          watch(()=>state.codeDialogLang,(data)=>{
            if(data!='other'){
              if(codeEditor){
                codeEditor.setCodeMode(data)
              }
            }
          })

          //弹窗逻辑处理
            function  alertChange($event) {
              if(editorToolsAttr.preview){
                ElMessage.info({showClose: true, message: "预览模式下不可编辑"});
                return
              }
              state.alertData[$event.atrr]=$event.value
                let selectData=editor.getSelection()
                if(!selectData){
                  selectData=""
                }
                if($event.atrr=='codeShow'){
                  nextTick(()=>{
                    if(!codeEditor){
                      codeEditor=new CodeEditor(codeEditorRef.value,state)
                    }
                    if(state.codeDialogLang!='other'){
                      codeEditor.setCodeMode(state.codeDialogLang)
                    }
                    codeEditor.setValue(selectData)
                  })
                }
                if($event.atrr=='sqlShow'){
                  nextTick(()=>{
                    if(!sqlEditor){
                      sqlEditor=new SqlEditor(sqlEditorRef.value,state)
                    }
                    sqlEditor.setValue(selectData)
                  })
                }

                if($event.atrr=='linkShow'){
                  state.hrefValue=selectData;
                }

            }

            //编辑器属性逻辑变化处理
            function attrChange(e){
              if(editorToolsAttr.preview){
                ElMessage.info({showClose: true, message: '预览模式下不可编辑'});
                return
              }
              let key=e.atrr,value=e.value;
              editorToolsAttr[key]=value;
              if(key=="split"&&value==true){
                  ctx.emit('preview');
              }
            }

        return {
          editorToolsAttr,
          scrollTip,
          alertDataList,
          langType,
          data,
          title,
          other,
          attr,
          mdInputRef,
          sqlEditorRef,
          codeEditorRef,
          selectFileMd,
          importMd,
          attrChange,
          command,
          chooseImage,
          alertChange,
          linkCancel,
          linkParse,
          tableParse,
          tableCancel,
          codeParse,
          codeCancel,
          sqlCancel,
          sqlParse,
          onSupport,
          ...toRefs(state),
          setData}
        }
    })
</script>

