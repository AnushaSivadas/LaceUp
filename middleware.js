const requireLogin = (req,res,next)=>{
    if(!req.session.user){
        req.session.redirectTo = req.path;
       return res.redirect('/userLogin')
    }
    next()
}
const requireAdminLogin = (req,res,next)=>{
    if(!req.session.admin){
        
       return res.redirect('/admin')
    }
    next()
}

const notRequireLogin = (req,res,next)=>{
    if(req.session.user){
       return res.redirect('/')
    }
    next()
}
const notRequireAdminLogin = (req,res,next)=>{
    if(req.session.admin){
       return res.redirect('/admin/dashboard')
    }
    next()
}

const cache =(req,res,next)=>{
    res.header("cache-control", "private,no-cache,no-store,must revalidate");
  res.header("Express", "-1");
  res.header("paragrm", "no-cache");
    next()
}

const storeCurrentRoute = (req,res,next)=>{
    if(!req.session.user){
        console.log('hoiiii',req.path)
        if(req.path=='/guestCart')
        req.session.redirectTo='/cart'
        else
        req.session.redirectTo=req.path
    }
    next()
}

module.exports = {
    requireLogin,
   requireAdminLogin,
   notRequireAdminLogin,
   notRequireLogin,
   cache,
   storeCurrentRoute
};