import {nextTick} from "vue";
import {saveMd} from "../util/fns";

//主编辑器
export  class MainEditor{
    public editor:any;
    public lastPos={row:0,column:0};
    public lastInsert:string
    public state:any
    public name="编辑器"
    constructor(root,height,state,ctx) {
        this.editor=ace.edit(root,{minLines: 0})
        this.editor.setTheme("ace/theme/nord_dark");
        this.editor.setAutoScrollEditorIntoView(true);
        this.state=state
        this.editor.focus();
        this.editor.resize(true)
        this.editor.setOptions({
            enableBasicAutocompletion: false,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });
        this.editor.on('change', data => {
            this.lastPos=this.editor.selection.getCursor()
            this.state.editorMain.currentValue=this.editor.getValue()
            nextTick(()=>{
                this.state.editorMain.editorScrollHeight=this.editor.getSession().getDocument().getLength() * this.editor.renderer.lineHeight + this.editor.renderer.scrollBar.getWidth()
            })

            this.editor.execCommand("startAutocomplete");
        });



        this.editor.session.on("changeScrollTop", (scrollTop) => {
            this.state.editorMain.editorScroll=Object.assign({},{
                scrollTop,
                height:this.editor.getSession().getDocument().getLength() *
                    this.editor.renderer.lineHeight + this.editor.renderer.scrollBar.getWidth()
            })
        }); //2个视窗都滚动

        this.editor.on("keydown", (data, e) => {
            if (e.keyCode === 83) {
                if (e.metaKey || e.ctrlKey) {
                    //ctrl +s 保存
                    e.preventDefault();

                    let data=this.state.editorMain
                    ctx.emit("on-save",{rawvalue:data.currentValue,html:data.html})
                }
            } else if (e.keyCode === 13) {
                this.enter()
            } else if (e.keyCode === 8) {
                this.del()
            }
        });
        this.editor.on("focus", () => {
            try {
                // editorMain_attr.lastdata=this.editor.getCursor()
                this.lastPos=this.editor.selection.getCursor()
            }catch (e) {
            }
        });
        this.editor.on("blur", () => {
            try {
                // editorMain_attr.lastdata=this.editor.getCursor()
                this.lastPos=this.editor.selection.getCursor()
            }catch (e) {
            }
        });
        return this
    }
    public scrollTo(val){
        this.editor.session.setScrollTop(val);
    }
    public  setValue(value){
        //console.log(value)
        this.editor.setValue(value,-1);

    }
    public insertContent(str:string) {// 插入文本
        this.editor.session.replace(this.editor.getSelectionRange(), str);
        this.lastInsert = str.replace(/\n/g, '');
    }

    public  setCursor(row = 0, column = 0) {// 设置焦点\
        console.log(row,column)
        this.editor.gotoLine(row+1, column,true);
        this.editor.focus();


    }
    public  getSelection():string{
        return this.editor.getSelectedText()
    }
    public enter(){
        if (this.lastInsert) {   //通过对比lastInsert的值 是否属于list内 然后处理 或者数字递增
            const list = ['-', '- [ ]', '- [x]'];
            if (list.includes(this.lastInsert.trim())) {
                this.insertContent('\n' + this.lastInsert);
            } else if (/^\d+\.$/.test(this.lastInsert.trim())) {
                this.insertContent(
                    '\n' + (parseInt(this.lastInsert, 0) + 1) + '.  '
                );
            }
        }
    }
    public isClean(){
        return this.editor.getValue().trim()==''
    }
    public del(){
        if (!this.isClean()) {
            const value = this.editor.getValue();
            if (value.split("\n").pop() === "") {
                this.lastInsert = "";
            }
        }
    }
    redo(){
        this.editor.redo();//重做编辑器
    }
    undo(){
        this.editor.undo();
    }

    public insertStrong() {// 粗体
        let cacolumne=this.lastPos
        const selection = this.getSelection();
        if (selection) {
            this.insertContent('**' + selection + '**');
        } else {
            this.insertContent('****');
            this.setCursor(cacolumne.row, cacolumne.column + 2);
        }
    }
    public insertItalic() {// 斜体
        let cacolumne=this.lastPos
        const selection = this.getSelection();
        if (selection) {
            this.insertContent('*' + selection + '*');
        } else {
            this.insertContent('**');
            this.setCursor(cacolumne.row, cacolumne.column + 1);
        }
    }
    public insertUnderline() {// 下划线  //和insertStrong原理一样
        let cacolumne=this.lastPos
        const selection = this.getSelection();
        if (selection) {
            this.insertContent("<u>" + selection + "</u>");
        } else {
            this.insertContent("<u></u>");
            this.setCursor(cacolumne.row, cacolumne.column + 3);
        }
    }
    public insertOverline() {// 删除线
        let cacolumne=this.lastPos
        const selection = this.getSelection();
        if (selection) {
            this.insertContent("~~" + selection + "~~");
        } else {
            this.insertContent("~~~~");
            this.setCursor(cacolumne.row, cacolumne.column + 2);
        }
    }
    public insertTitle(level:any) {// 插入标题
        let cacolumne=this.lastPos
        console.log(cacolumne)
        const titles = {
            1: "#  ",
            2: "##  ",
            3: "###  ",
            4: "####  ",
            5: "#####  ",
            6: "######  "
        };
        const selection = this.getSelection();
        if (selection) {
            this.insertContent("\n" + titles[level] + selection + "\n");
            return
        } else {
            const title = titles[level];
            if (this.isClean()) {  //判断是否是空文档 特殊处理
                this.insertContent(title+"\n ");
                this.setCursor(0,title.length)
                return;
            } else {
                this.insertContent("\n" + title+"\n ");
                this.setCursor(cacolumne.row + 1,title.length)
                return;
            }
        }
    }

    public insertLine() {// 插入分割线
        if (this.isClean()) { //判断是否是空文档 特殊处理
            this.insertContent("----\n");
        } else {
            this.insertContent("\n\n----\n");
        }
    }
    public insertQuote() {// 引用
        let cacolumne=this.lastPos
        const selection = this.getSelection();
        if (selection) {
            this.insertContent("\n>  " + selection + "\n\n");
        } else {
            if (this.isClean()) {
                this.insertContent(">  ");
                this.setCursor(0, 3);
            } else {
                this.insertContent("\n>  ");
                this.setCursor(cacolumne.row + 1, 3);
            }
        }
    }
    public insertUl() {// 无序列表

        let cacolumne=this.lastPos
        const selection = this.getSelection(); //和insertTitle原理一样
        if (selection) {
            this.insertContent("\n-  " + selection + "\n\n");
        } else {
            if (this.isClean() || cacolumne.column === 0) { //此时不仅仅判断为空 还判断是否是一行的起始位置
                this.insertContent("-  ");
                this.setCursor(cacolumne.row, 3);
            } else {
                this.insertContent("\n-  ");
                this.setCursor(cacolumne.row + 1, 3);
            }
        }
    }
    public insertOl() {// 有序列表
        let cacolumne=this.lastPos
        const selection = this.getSelection();
        if (selection) {
            this.insertContent("\n1.  " + selection + "\n\n");
        } else {
            if (this.isClean() || cacolumne.column === 0) {
                this.insertContent("1.  ");
                this.setCursor(cacolumne.row, 4);
            } else {
                this.insertContent("\n1.  ");
                this.setCursor(cacolumne.row + 1, 4);
            }
        }
    }
    public insertFinished() {// 已完成列表
        let cacolumne=this.lastPos
        const selection = this.getSelection();
        if (selection) {
            this.insertContent("\n- [x] " + selection + "\n\n");
        } else {
            if (this.isClean() || cacolumne.column === 0) {
                this.insertContent("- [x] ");
                this.setCursor(cacolumne.row, 6);
            } else {
                this.insertContent("\n- [x] ");
                this.setCursor(cacolumne.row + 1, 6);
            }
        }
    }
    public insertNotFinished() {// 未完成列表
        let cacolumne=this.lastPos
        const selection = this.getSelection();
        if (selection) {
            this.insertContent("\n- [ ] " + selection + "\n\n");
        } else {
            if (this.isClean() || cacolumne.column === 0) {
                this.insertContent("- [ ] ");
                this.setCursor(cacolumne.row, 6);
            } else {
                this.insertContent("\n- [ ] ");
                this.setCursor(cacolumne.row + 1, 6);
            }
        }
    }
    public clear(){
        this.editor.setValue("")
    }
    public insertImage(url) {// 插入图片
        if(typeof url=="string"){
            this.insertContent("\n![image]("+url+")");
        }else{

            this.insertContent("\n![image](http://csdn.52wike.com/wike.jpeg)");
        }
    }
    public exportFile() {// 导出为.md格式
        saveMd(this.editor.getValue(),"我的文档.md");
    }
}