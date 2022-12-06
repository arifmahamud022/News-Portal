var express = require('express');
var router = express.Router();
var multer = require('multer');
require('dotenv').config()

const { isAuth } = require('../config/auth')

const base_url = process.env.BASEURL || 'http://localhost:3000';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/profileimage');
  },
  filename: function (req, file, cb) {
      
      cb(null, today + '_' + file.originalname);
  },
});

var upload = multer({ storage: storage });

var User = require('../models/user');
var Categories = require('../models/categories');
var Post = require('../models/post');
var View = require('../models/view');

const ViewAdd = async (req) => {
  let date = new Date();
  date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const postid = req.params.slug;
  const userip = req.socket.remoteAddress || req.ip;
  const referer = req.headers.referer;

  const useragent = req.session.useragent = {
    browser: req.useragent.browser,
    version: req.useragent.version,
    os: req.useragent.os,
    platform: req.useragent.platform,
    geoIp: req.useragent.geoIp, // needs support from nginx proxy
    source: req.useragent.source,
  };

  const ifconfigRes = await fetch(`https://ifconfig.co/json?ip=${userip}`);
  const ifconfig = await ifconfigRes.json();

  const user_agent = useragent;
  const device = req.device.type;
  const platform = useragent.platform;
  const operating = useragent.os;
  const browser = useragent.browser;
  const browser_version = useragent.version;
  let country;
  let time_zone;
  let asn;
  let asn_org;

  if (ifconfig.asn) {
    country = ifconfig.country;
    time_zone = ifconfig.time_zone;
    asn = ifconfig.asn;
    asn_org = ifconfig.asn_org;
  } else {
    country = '';
    time_zone = '';
    asn = '';
    asn_org = '';
  }

  const viewData = new View({
    postid: postid,
    userip: userip,
    method: 'GET',
    host: base_url,
    url: `${base_url}/${postid}`,
    referer: referer,
    user_agent: user_agent,
    country: country,
    device: device,
    platform: platform,
    operating: operating,
    browser: browser,
    browser_version: browser_version,
    time_zone: time_zone,
    asn: asn,
    asn_org: asn_org,
  });

  const view = await View.findOne({ postid: postid, userip: userip, date_at: date });
  console.log('view :- ', view);
  if (view == null) {
    const addView = await new View(viewData).save()
    console.log('addView : ', addView)
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  const posts = await Post.find({});
  const user = await User.find({});
  const data = {
    title: 'Nes Express',
    baseUrl: base_url,
    flashsms: req.flash('success'),
    flasherr: req.flash('error'),
    user: req.user,
    posts: posts,
    user: user
  };
  
  res.render('index', data);
});


/* GET home page. */
router.get('/:slug', async function (req, res, next) {

  let slug = req.params.slug;
  console.log('slug :- ', slug);
  if (slug == 'profileEdit') {
    if (req.user) {
      res.render('profileEdit',  {
        title: 'Profile Edit',
        baseUrl: base_url,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
      });
    } else {
      req.flash('success', 'You are allready logged');
      res.redirect('/');
    }
  };
  if (slug == 'profile') {
    if (req.user) {
      res.render('profile',  {
        baseUrl: base_url, 
        title: 'User account login', 
        user: req.user
      });
    } else {
      req.flash('success', 'You are allready logged');
      res.redirect('/');
    }
  };
  if (slug == 'login') {
    if (!req.user) {
      res.render('login', {
        baseUrl: base_url, title: 'User account login', user: req.user
      });
    } else {
      req.flash('success', 'You are allready logged');
      res.redirect('/login');
    }
  } else if (slug == 'register') {
    res.render('register', {
      baseUrl: base_url, title: 'User account register', errors: '', user: req.user
    });
  } else {
    const users = await User.find({});
    const user = await User.findOne({});
    const posts = await Post.find({});
    const post = await Post.findOne({ slug: slug });
    if (post) {
      ViewAdd(req);
      const data = {
        title: post.title,
        baseUrl: base_url,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
        post: post,
        user: user,
      };
      res.render('postView', data);
    } else {
      const data = {
        title: 'Nes Express',
        baseUrl: base_url,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
        posts: posts,
        users: users,
      };
      res.render('index', data);
    } 
  };  



});




router.get('/login', function (req, res, next) {
  if (!req.user) {
    res.render('login', {
      baseUrl: base_url, title: 'User account login', user: req.user
    });
  } else {
    req.flash('success', 'You are allready logged');
    res.redirect('/');
  }
});

router.get('/register', function (req, res, next) {
  res.render('register', {
    baseUrl: base_url, title: 'User account register', errors: '', user: req.user
  });
});

/* post image upload Router */
router.post('/profile-image',
    upload.single('profileimg'),
    isAuth,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const user = await User.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var profileimg = today + '_' + req.file.originalname;
        } else {
            var profileimg = user.profileimg;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
           
            res.render('/profile', {
                title: 'Profile Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                user: user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updatePost = {
              profileimg: profileimg,
            };

            const upData = await User.updateOne({ _id: id }, updateUser);

            console.log('Post Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/profile?id=${id}`);
            res.redirect(`/profile?id=${id}`);
        }

    }
);


router.post('/profileEdit', 
    upload.single('profileimg'),
    
    async function (req, res, next) {
        
        let name = req.body.name;
        let username = req.body.username;
        let email = req.body.email;
       

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var profileimage = today + '_' + req.file.originalname;
        } else {
            var featured_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        
        

    }
);







module.exports = router;
