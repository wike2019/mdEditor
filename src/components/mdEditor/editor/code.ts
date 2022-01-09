//代码编辑器
export  class CodeEditor {
    public  editor:any;
    public constructor(root,state){

        this.editor=ace.edit(root,{minLines: 0})

        this.editor.setTheme("ace/theme/nord_dark");
        this.editor.setAutoScrollEditorIntoView(true);
        this.editor.setOption("maxLines", 25);
        this.editor.setOption("minLines", 25);
        this.editor.resize(true)
        this.editor.setOptions({
            enableBasicAutocompletion: false,
            enableSnippets: true,
            enableLiveAutocompletion: true,
        });

        this.editor.on('change', data => {
            this.editor.execCommand("startAutocomplete");
            state.codeValue=this.editor.getValue()
        });

        return this
    }
    public  setValue(value){
        this.editor.setValue(value,-1);
    }
    public  setCodeMode(data){
        this.editor.session.setMode("ace/mode/"+data);
    }
}

