const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});
const itemsSchema={
    name:String
};
const Item=mongoose.model("Item",itemsSchema);
const listSchema={
    name:String,
    items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);
const work=new Item({name:"Work"});
const find=new Item({name:"Find"});
const take=new Item({name:"Take"});
app.get("/",function(req,res)
{
    Item.find().then(function(result)
    {
        if(result.length===0)
        {
            Item.insertMany([work,find,take]).then(function(res)
            {
                console.log(res);
            });
            res.redirect("/");
        }
        else
        {
            res.render("list",{listTitle:"Today",newListItems:result});
        }
    });
    // res.send();
});
app.get("/:customListName",function(req,res)
{
    const customListName=_.capitalize(req.params.customListName);
    const defaultItems=[work,find,take];
    List.findOne({name:customListName}).then(function(result)
    {
        if(!result)
        {
            const list=new List({
                name:customListName,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
        }
        else
        {
            res.render("list",{listTitle:customListName,newListItems:result.items});
        }
    });
});
app.get("/about",function(req,res)
{
    res.render("about");
})
app.post("/work",function(req,res)
{
    const item=req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})
app.post("/",function(req,res)
{
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item=new Item({name:itemName});
    if(listName==="Today")
    {
        item.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name:listName}).then(function(result)
        {
            result.items.push(item);
            result.save();
            res.redirect("/"+listName);
        });
    }
});
app.post("/delete",function(req,res)
{
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today")
    {
        Item.findByIdAndRemove(checkedItemId).then(function(r)
        {
            console.log(r);
            res.redirect("/");
        });
    }
    else
    {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(result)
        {
            console.log(result);
            res.redirect("/"+listName);
        });
    }
});
app.post("/new",function(req,res)
{
    const newList=req.body.newList;
    res.redirect("/"+newList);
});
app.listen(3000,function()
{
    console.log('server started on port 3000');
})