import express from 'express';
import MessageResponse from '../interfaces/MessageResponse';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.post('/tests', (req, res)=>{
  console.log(req.body);
  
  const websiteUrl = req.body;

  console.log('websiteUrl', websiteUrl);
  
  res.json({
    message: "it's working"
  })
})

export default router;
