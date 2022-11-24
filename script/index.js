

let arr=[];
arr=[55533,22243,33290,873832];
let namearr=[];
namearr=['mazen emad ','ali mohamed','kareem emad','ahmed salah'];
let datearr=["1/12/2022","5/12/2022","20/12/2022","30/12/2022"];


let info=[];
for(let i=0;i<arr.length;i++){
    info[i]={
        id:arr[i],
        name:namearr[i],
        date:datearr[i]
        // date:''
    }
}

    // let p1= info[0].name
    // let p2=info[1].name
    // let p3=info[2].id
    // console.log(p1,p2,p3)

let submit = document.getElementById('submit');
let submit1 = document.getElementById('submit1');
let alert1 = document.getElementById('alert1');
let alert2 = document.getElementById('alert2');

let name = '';
let date='';
let idnum = document.getElementById('num');
submit1.addEventListener('click',()=>{
    for(let i=0;i<arr.length;i++){
        if(idnum.value == info[i].id){
        name = info[i].name
        date= info[i].date
        submit.style.display = 'block';
        alert2.style.display="block";
        setTimeout(()=>{
            alert2.style.display='none'
        },5000);
        }else{
        alert1.style.display="block";
        setTimeout(()=>{
            alert1.style.display='none'
        },5000);
        }
    }
});
submit.addEventListener('click',()=>{
    generetPdf(name,date);
    setTimeout(()=>{
        submit.style.display = 'none';
    },3000)
})

const generetPdf = async (name,date)=>{
    const {PDFDocument,rgb} = PDFLib;

    const exBytes = await fetch("static/IeeeCertificate.pdf").then((res)=>{
        return res.arrayBuffer()
    });

    const exFont = await fetch('static/BhuTukaExpandedOne-Regular.ttf').then((res)=>{
        return res.arrayBuffer();
    })
    
    const pdfDoc = await PDFDocument.load(exBytes)
    
    pdfDoc.registerFontkit(fontkit);
    const myFont = await pdfDoc.embedFont(exFont);

    const pages = pdfDoc.getPages();
    const firstP = pages[0];
    firstP.drawText(name,{
        x:270,
        y:620,
        size:180,
        font:myFont,
        color: rgb(0, 0, 0)
    })

    firstP.drawText(date,{
        x:330,
        y:260,
        size:15,
        font:myFont,
        color: rgb(0, 0.76, 0.8)
    })

    const uri = await pdfDoc.saveAsBase64({dataUri: true});
    saveAs(uri,"Certificate.pdf",{autoBom:true})
};




