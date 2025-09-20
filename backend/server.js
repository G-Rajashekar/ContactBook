const express=require("express")
const cors=require("cors")
const db=require("./db")

const app=express()
app.use(cors())
app.use(express.json())

const PORT=5000;

app.post("/contacts",(req,res)=>{
    const {name,email,phone}=req.body;
    if (!name || !email || !phone) return res.status(400).json({error:"All fields are required"});
    const stmt=db.prepare("INSERT INTO contacts(name,email,phone) VALUES(?,?,?)");
    stmt.run([name,email,phone],function(err){
        if (err) return res.status(500).json({error:err.message});
        res.status(201).json({id:this.lastID,name,email,phone});
    });
});

app.get("/contacts",(req,res)=>{
    const page=parseInt(req.query.page)||1;
    const limit=parseInt(req.query.limit)||5;
    const offset=(page-1)*limit;

    db.all("select count(*) as count from contacts",(err,countResult)=>{
        if (err) return res.status(500).json({error:err.message})
        const total= countResult[0].count;
        
        db.all("select * from contacts limit? offset?",[limit,offset],(err,rows)=>{
            if (err) return res.status(500).json({error:err.message})
            res.json({contacts:rows,total});
        });
    });

});

app.delete("/contacts/:id",(req,res)=>{
    const id=req.params.id;
    db.run("DELETE FROM contacts where id=?",[id],function(err){
        if (err) return res.status(500).json({error:err.message});
        res.status(204).send();
    });
});

app.get("/",(req,res)=>{
    console.log("hello world");
    res.send("hello world");
})

app.listen(PORT,()=> console.log(`server running on port ${PORT}`));