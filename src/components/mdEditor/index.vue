<template>
  <main class="wk_editor">
    <div v-if="!isPreview"
         :class="`markdown ${editorToolsAttr.fullscreen ? 'fullscreen' : ''}`"
         ref="markdown"
         :style="{ width: width + 'px', height: height + 'px' }"
    >
      <WTools  @on-upload-image="upload" @preview="DoPreview" ></WTools>
      <div
          class="close-preview"
          v-show="editorToolsAttr.preview && !isPreview"
          @click="editorToolsAttr.preview = false"
      >
        <span class="iconfont icon-close"></span>
      </div>
      <!-- 编辑器 -->
      <div
          class="markdown-content"
          :style="{ background: preview ? '#fff' : '' }"
      >
        <!-- ace 编辑器 -->
        <div
            class="codemirror"
            ref="editorRef"
            id="editor"
            v-show="!editorToolsAttr.preview"
            @mouseenter="mouseScrollSide('left')"
        ></div>
        <!--  预览效果 -->
        <div
            v-show="editorPreview"
            class="markdown-preview"
            :class="`${'markdown-theme-' + themeName}`"
            ref="previewRef"
            @scroll="previewScroll"
            @mouseenter="mouseScrollSide('right')"
        >
          <div ref="previewInner">
          </div>
        </div>
      </div>
    </div>
    <!-- 设置时isPreview只显示预览-->
    <div v-else
          ref="markdown"
         class="markdown-preview markdown"
         :class="`${'markdown-theme-' + themeName}`"
    >
    <div  ref="previewRef">
          <div ref="previewInner"></div>
    </div>
    </div>
    <!--    预览图片-->

  </main>
    <div style="opacity:0;height:0;overflow:hidden">
      <el-image
          v-show="previewImgModal"
          ref="prevImage"
          :src="previewImageSrc"
          :append-to-body="true"
          :preview-src-list="imageListSrc">
      </el-image>
    </div>

</template>

<script lang="ts">
import {defineComponent, nextTick, onMounted,onUnmounted, ref, computed, watch, provide, reactive,toRefs} from 'vue'
import {MainEditor} from "./editor/editor"
import {toHtml} from "./util/render";
import {core} from "../../core/core";
import { ElMessage } from 'element-plus'
import WTools from "./tool.vue"
  export default defineComponent({
    name: 'wikeMd',
    components:{
      WTools
    },
    props: {
      value: {
        type: [String, Number],
        default: "",
      },
      width: {
        // 初始化宽度
        type: [Number, String],
        default: "auto",
      },
      height: {
        // 初始化高度
        type: Number,
        default: 600,
      },
      themeName: {// 默认主题
        type: String,
        default: 'dark'
      },
      copyCode: {// 复制代码
        type: Boolean,
        default: true
      },
      copyBtnText: {// 复制代码按钮文字
        type: String,
        default: '复制代码'
      },
      autoSave: {
        // 是否自动保存
        type: Boolean,
        default: false,
      },
      interval: {
        // 自动保存间隔 mm
        type: Number,
        default: 10000,
      },
      isPreview: {
        //是否是预览模式
        type: Boolean,
        default: false,
      },
    },
    emits:['input','on-ready','on-save','on-upload-image','on-copy'],
    setup(props,ctx){
      let state=reactive({
        isPreview:props.isPreview, //判断是否是编辑模式
        previewImageSrc: "", //当前预览等图片地址
        imageList:[],//图片dom列表,
        imageListSrc:[],//图片url列表,
        editorMain:reactive({
          editorScrollHeight:0,  //编辑滚动高度
          html:"", //动态计算的html
          editorScroll:reactive({ //编辑器高度
            height:0,
            scrollTop:0
          }),
          currentValue:"" //当前编辑器的值
        }),
        previewImgModal:false,
        editorToolsAttr:{  //编辑器属性
          scrolling:true,
          fullscreen:false,
          scrollSide:"",
          split:true,
          preview:false,
        },
        editorPreview:false,//预览
      })

      //ref对象
      let editorRef=ref<HTMLElement>(null)
      let previewRef=ref<HTMLElement>(null)
      let previewInner=ref<HTMLElement>(null)
      let prevImage=ref(null)
      provide("editorToolsAttr",state.editorToolsAttr)
      //判断编辑器预览模式
      state.editorPreview = computed(() => {
        return state.editorToolsAttr.preview ?  state.editorToolsAttr.preview : state.editorToolsAttr.split;
      });

      // 预览图片
      function previewImage(src) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          state.previewImageSrc=src
          state.previewImgModal=true
          prevImage.value.clickHandler()
        };
      }

      //复制可以剪切图片，只允许一张
      function handlePaste(e,ctx) {
        const { clipboardData = {} } = e;
        const { types = [], items } = clipboardData;
        let item = null;
        for (let i = 0; i < types.length; i++) {
          if (types[i] === "Files") {
            item = items[i];
            break;
          }
        }
        if (item) {
          const file = item.getAsFile();
          if (/image/gi.test(file.type)) {
            ctx.emit("on-upload-image", file);
            e.preventDefault();
          }
        }
      };
      //取消图片绑定事件
      function clearImgOnclick(){
        if (  state.imageList.length > 0) {
          for (let i = 0, len = state.imageList.length; i < len; i++) {
            state.imageList[i].onclick = null;
          }
        }
      }

      //监听查看大图
      function  addImageClickListener() {// 监听查看大图

        clearImgOnclick()
        setTimeout(() => {
          state.imageList=previewRef.value.querySelectorAll('img')
          state.imageListSrc=[]
          for (let i = 0, len = state.imageList.length; i < len; i++) {
            let src =  state.imageList[i].getAttribute('src');
            state.imageListSrc.push(src)
            state.imageList[i].onclick = () => {
              previewImage(src); //内存泄漏
            };
          }
        }, 1);
      }

      //渲染数据
      function renderHtml(rawData){

        toHtml(rawData).then((data:string)=>{
          data.replace(/href="/gi, 'target="_blank" href="');
          if (props.copyCode && data !== '') {
            data = data.replace(/<pre>/g, '<div class="code-block"><span class="copy-code">' + props.copyBtnText + '</span><pre>').replace(/<\/pre>/g, '</pre></div>')
          }
          addImageClickListener();
          addCopyListener();
          state.editorMain.html=data;
          previewInner.value.innerHTML=data;

          ctx.emit('input', {data:rawData,html:data});
        })
      }
      function copy(e) {
        const code =e.parentNode.querySelectorAll('pre')[0].innerText;
       
        const aux = document.createElement('textarea');
        aux.value= code;
        aux.setAttribute('readonly', 'readonly')
        document.body.appendChild(aux);
        aux.select();
        document.execCommand('copy');
        document.body.removeChild(aux);
        ctx.emit('on-copy', code);
        ElMessage("代码已经复制到粘贴版")
      }


      function wrapperCopy(e){
        let  l = e.target
        if(l.className.indexOf('copy-code')>-1){
          copy(l)
        }
      }


      //监听复制
      function addCopyListener() {// 监听复制操作
        nextTick(() => {
          let mdList=document.querySelector('.markdown')
          mdList.removeEventListener('click',wrapperCopy)
          mdList.addEventListener('click',wrapperCopy)
        })
      }

      // 设置究竟是哪个半边在主动滑动
      function mouseScrollSide(side:string) {
        state.editorToolsAttr.scrollSide=side
      }
      //预览滚动同步编辑器滚动
      const previewScroll = () => {

        if (state.editorToolsAttr.scrolling && state.editorToolsAttr.scrollSide === 'right') {
          const preview =previewRef.value;
          if(!preview){
            return
          }
          const contentHeight = preview.offsetHeight;
          const previewScrollHeight = preview.scrollHeight;
          const previewScrollTop = preview.scrollTop;
          const scrollTop = parseInt((previewScrollTop * (state.editorMain.editorScrollHeight - contentHeight)) / (previewScrollHeight - contentHeight), 0);
          state.editor.scrollTo(scrollTop);
        }
      };
      //编辑器滚动同步预览滚动
      const markdownScroll = () => {
        //编辑器区域滚动
        if ( state.editorToolsAttr.scrolling && state.editorToolsAttr.scrollSide =="left") {
          let  { height, scrollTop } =state.editorMain.editorScroll ;
          const preview = previewRef.value;
          const contentHeight = preview.offsetHeight;
          const previewScrollHeight = preview.scrollHeight;
          if (preview) {

            preview.scrollTop = parseInt(
                (scrollTop * (previewScrollHeight - contentHeight)) / (height - contentHeight),
                0,
            );
          }
        }
      };

      //将上传文件传给用户处理
      function  upload($event) {
        ctx.emit("on-upload-image", $event);
      }
      //监听变化

      //监听编辑器内容变化试试渲染html
      watch(() => state.editorMain.currentValue,(data,old)=>{
           renderHtml(state.editorMain.currentValue)
      })
      watch(() => state.editorMain.editorScroll,(data)=>{
           markdownScroll()
      })
      //监听外部props。value同步编辑器 不推荐
      watch(()=>props.value, (value) => {
        state.editor.setValue(value||"")
      });
      let codeCopy=(e) => {
        handlePaste(e,ctx)
      }

      //dom操作
      onMounted(()=>{
        //初始化编辑器
        state.editor=new MainEditor(editorRef.value,props.height,state,ctx)
        core.bus.emit("MainEditorReady",state.editor)
        //暴露api
        ctx.emit('on-ready', {
          vm:state.editor,
          insertContent:(str)=>{
            state.editor.insertContent(str)
          },
          insertImage:(str)=>{
            state.editor.insertImage(str)
          }
        })
        //渲染默认数据
        state.editor.setValue(props.value?props.value:"")
        //监听复制对象
        if(document.querySelector('#editor')){
           document.querySelector('#editor').addEventListener('paste', codeCopy)
        }
       
      })

      //切换分屏时渲染预览
      function DoPreview(){
        nextTick(()=>{
          if( previewInner.value){
            previewInner.value.innerHTML = state.editorMain.html;
          }

        })
      }

      onUnmounted(()=>{
        clearImgOnclick()
        let mdList=document.querySelector('.markdown')
        let editor= document.querySelector('#editor')
        if(mdList){
        mdList.removeEventListener('click',wrapperCopy)
        }
        if(editor){
          editor.removeEventListener('paste', codeCopy)
        }
      })


      return {
       ...toRefs(state),
        ...toRefs(props),
        previewRef,
        editorRef,
        previewInner,
        markdownScroll,
        previewScroll,
        mouseScrollSide,
        upload,
        DoPreview,
        prevImage
      }
    }
  })



</script>
