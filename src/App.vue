<template>
  <div class="app">
    <wikeMd

        @input="getData"
        @on-ready="onReady"
        @on-upload-image="onUploadImage"
        @copy-code="copyCode"
        :value="ruleForm.mdData"
        :height="800"
    ></wikeMd>
  </div>
</template>
<script lang="ts">
import wicon from  "./components/icon/index.vue"
import wikeMd from './components/mdEditor/index.vue'
import {defineComponent, ref,reactive,toRefs} from 'vue'
export default defineComponent({
  name: 'make_article',
  components:{
    wikeMd,
    wicon
  },
  setup(){

    let state=reactive({ruleForm:{

        mdData:"",
        content:""
      }})
    let ruleFormRef=ref(null)
    let insertImage

    let  rules= {

    }

    function onReady(e){
      insertImage=e.insertImage
    }
    function copyCode(e){
      console.log(e)
    }
    async function onUploadImage(e){

        insertImage("https://wikecloud.oss-cn-hangzhou.aliyuncs.com/base/8b79008ea545dfe626d9eeb4fca95026.jpg")

    }
    function getData(e){
      state.ruleForm.content=e.data
    }

    return {
      ...toRefs(state),
      rules,
      ruleFormRef,
      onReady,
      onUploadImage,
      copyCode,
      getData
    }
  }
})

</script>
