<template>
  <i :class="classList" aria-hidden="true"></i>
</template>

<script lang="ts">
  import { defineComponent} from 'vue'
  export default defineComponent({
    name: 'icon',
    props: {
      name: {
        type: String,
        required:true
      }
    },
    setup(props){
      const classList="fa "+props.name
      return {classList: classList}
    }
  })
</script>
