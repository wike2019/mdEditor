import {core} from "../../../core/core";
import {nextTick} from "vue";

//解析sql
export  function  sqlParse(data:string) {
    let dataContent=/CREATE\s+TABLE\s+`(\w+)`\s*\(([\W\w]+)\)/i.exec(data)
    let sqlItemList=dataContent[2].split(/,\n/)
    let tableName=dataContent[1]
    let lineResult=[]
    for(let i=0;i<sqlItemList.length;i++){

        let isNull=/\s*`(\w+)`\s+([\S]+)\s+(NOT NULL)\s*/i.exec(sqlItemList[i]) //是否为null
        let isDefault=/\s*`(\w+)`\s+([\S]+)[\W\w]+DEFAULT\s+([\S]+)\s*/i.exec(sqlItemList[i]) //默认值2
        let isDefaul2=/\s*`(\w+)`\s+([\S]+).+DEFAULT\s+[\'\"](.*?)[\'\"]\s*/i.exec(sqlItemList[i]) //默认值1
        let isType=/^\s*`(\w+)`\s+([\S]+)\s*/i.exec(sqlItemList[i]) //表名和数据类型
        let isAnnotation=/\s*`(\w+)`\s+([\S]+).+COMMENT\s+[\'\"](.*?)[\'\"]\s*/i.exec(sqlItemList[i])//注释
        if(isType){
            lineResult[i]=[];
        }else{
            continue;
        }


        lineResult[i][0]=isType[1]
        lineResult[i][1]=isType[2]
        lineResult[i][2]=isNull?"否":"是"
        if(isDefaul2){
            lineResult[i][3]=isDefaul2[3]
        }else if(isDefault){
            lineResult[i][3]=isDefault[3]
        }else{
            lineResult[i][3]='无'
        }
        if(isAnnotation){
            lineResult[i][4]=isAnnotation[3]
        }else{
            lineResult[i][4]='无'
        }

    }
    for(let i=0;i<sqlItemList.length;i++){
        let isIndex=/(\w+\s+\w*)\s*`(\w+)`\s+([\S]+)\s*/i.exec(sqlItemList[i]) //获取索引
        let isPrimary=/PRIMARY\s+KEY\s+\((.*)\).*/i.exec(sqlItemList[i]) //获取索引




        if(isPrimary){
            let isPrimarylist=isPrimary[1].split(',')//        item7=item7[1].split(',')
            for(let k=0;k<isPrimarylist.length;k++){  // for(let k=0;k<item7.length;k++){
                console.log(isPrimarylist)
                let value=isPrimarylist[k].trim(/[\"\']/g)  //     let temp=item7[k].trim(/[\"\']/g)
                let indexArr=/`(\w+)`/i.exec(value)[1] // temp=/`(\w+)`/i.exec(temp)[1]
                for(let k2=0;k2<lineResult.length;k2++){
                    if(lineResult[k2][0]==indexArr){
                        lineResult[k2][5]= lineResult[k2][5]||''
                        if(lineResult[k2][5].indexOf("主键")==-1)
                            lineResult[k2][5]+="主键 "
                    }
                }

            }
        }
        if(isIndex){
            let KEY=isIndex[1]
            let indexList=isIndex[3].split(',')
            for(let t=0;t<indexList.length;t++){
                let value=indexList[t].trim(/[\"\']/g)
                let indexArr=/`(\w+)`/i.exec(value)[1]
                for(let k3=0;k3<lineResult.length;k3++){
                    if(lineResult[k3][0]==indexArr){
                        lineResult[k3][5]= lineResult[k3][5]||''
                        if(/^\s*UNIQUE\s+KEY\s*$/i.exec(KEY)){
                            KEY='唯一索引'+isIndex[3].replace(/\`/g,"")
                        }
                        if(/^\s*KEY\s*$/i.exec(KEY)){
                            KEY='普通索引'+isIndex[3].replace(/\`/g,"")
                        }
                        if(/^\s*FULLTEXT\s+KEY\s*$/i.exec(KEY)){
                            KEY='全文索引'+isIndex[3].replace(/\`/g,"")
                        }
                        if(lineResult[k3][5].indexOf(KEY)==-1){
                            lineResult[k3][5]+=KEY+' '
                        }

                    }

                }
            }
        }
    }
    return [tableName,lineResult]
}

/*
* 渲染表格
* */
export function renderTable(tableHeader,tableData,align="default") {
    let splitType={
        "default":'------------',
        "left":':------------',
        "center":':------------:',
        "right":'------------:',
    }
    let content='\n\n'
    let header ="|"
    for(let j =0;j<tableHeader.length;j++){
        header+=tableHeader[j]+'|'
    }
    content+=header
    content+='\n'
    let split='|'
    for(let t =0;t<tableHeader.length;t++){
        split+=splitType[align]+'|'
    }
    content+=split
    content+='\n'
    let maxLen=0;
    for (let k=0;k<tableData.length;k++){
        if(maxLen<tableData[k].length){
            maxLen=tableData[k].length
        }
    }
    for(let i =0;i<tableData.length;i++){
        content+='|'
        for(let j =0;j<maxLen;j++){
            if(tableData[i][j]!=undefined){
                content+=tableData[i][j]+'|'
            }else{
                content+='无数据|'
            }

        }
        content+='\n'
    }
    content+='\n'
    return content;
}
const worker = new core.DWorker((data:any)=>{
    //执行一系列操作
    importScripts('https://csdn.52wike.com/common/js/marked.min.js');
    importScripts('https://csdn.52wike.com/common/js/highlight.pack.js');

    marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function(code) {
                return hljs.highlightAuto(code).value;
            },
            pedantic: false,
            gfm: true,
            tables: true,
            breaks: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false
        }
    );
    return marked(data.data)
},{});
//markdown转html
export  function  toHtml(data){
    let result={
        data,  //全局数据
    }


    return worker.send({
        method: 'format',
        data: result
    })
}
