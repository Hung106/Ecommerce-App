const express = require("express");
const router = express.Router();
const Review = require('../controllers/review')

router.get('/:id', Review.GetReviewByProduct)
router.post('/create/:id', Review.CreateReview)
router.put('/update/:review_id', Review.UpdateReviewByUser)
router.delete('/delete/:id', Review.DeleteReview)

module.exports=router
 