//sql编辑器
export  class SqlEditor {
    public  editor:any;
    public constructor(root,state){
        this.editor=ace.edit(root,{minLines: 0})
        this.editor.setTheme("ace/theme/nord_dark");
        this.editor.session.setMode("ace/mode/sql");
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
            state.sqlValue=this.editor.getValue()
        });

        return this
    }
    public  setValue(value){
        this.editor.setValue(value,-1);
    }

}

