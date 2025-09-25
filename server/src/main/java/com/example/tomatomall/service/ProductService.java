package com.example.tomatomall.service;

import com.example.tomatomall.exception.TomatoMallException;
import com.example.tomatomall.po.*;
import com.example.tomatomall.repository.*;
import com.example.tomatomall.util.SecurityUtil;
import com.example.tomatomall.vo.CommentVO;
import com.example.tomatomall.vo.ProductAmountVO;
import com.example.tomatomall.vo.ProductVO;
import com.example.tomatomall.vo.SpecificationVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;


@Service
public class ProductService {
    @Autowired
    ProductRepository productRepository;
    @Autowired
    ProductAmountRepository productAmountRepository;
    @Autowired
    SpecificationRepository specificationRepository;
    @Autowired
    CommentRepository commentRepository;
    @Autowired
    CartsRepository cartsRepository;
    @Autowired
    EvaluateRepository evaluateRepository;
    @Autowired
    private SecurityUtil securityUtil;

    public List<ProductVO> getAllProduct(){//完成了
        List<Product> ls=productRepository.findAll();
        List<ProductVO> ans=new ArrayList<>();

        for(Product tem:ls){
            ProductVO t=tem.toVO();
            List<SpecificationVO> sp=new ArrayList<>();
            for(Specification s:specificationRepository.findByProductId(tem.getId())){
                sp.add(s.toVO());
            }
            t.setSpecifications(sp);
            ans.add(t);
        }
        return ans;
    }

    public ProductVO getProduct(Integer id){//完成了
        ProductVO p=productRepository.findById(id).get().toVO();
        List<SpecificationVO> sp=new ArrayList<>();
        for(Specification s: specificationRepository.findByProductId(id)){
            sp.add(s.toVO());
        }
        p.setSpecifications(sp);
        return p;
    }

    public ProductAmountVO getAmount(Integer id){//完成了
        ProductAmount p=productAmountRepository.findByProductId(id);
        if(p==null){
            throw TomatoMallException.ProductNotFound();
        }
        return p.toVO();
    }

    public String deleteProduct(Integer id){//完成了
        productRepository.delete(productRepository.findById(id).get());
        productAmountRepository.delete(productAmountRepository.findByProductId(id));

        for(Specification tem:specificationRepository.findByProductId(id))
            specificationRepository.delete(tem);
        List<Carts> carts= cartsRepository.findByProductId(id);
        for(Carts c:carts){
            cartsRepository.delete(c);
        }
        return "删除成功";
    }

    public ProductVO createProduct(ProductVO p){//完成了
        if(p.getTitle() ==null || p.getPrice() ==null || p.getRate() ==null)
            throw TomatoMallException.NoEnoughArguments();
        Product tem=p.toPO();
        productRepository.save(tem);//据说这时候id就有了
        //System.out.println(tem.getId());
        productAmountRepository.save(new ProductAmount(tem.getId(),0,0));
        if(p.getSpecifications()!=null){
            for(SpecificationVO s:p.getSpecifications()){
                Specification sp=s.toPO();
                sp.setProductId(tem.getId());
                specificationRepository.save(sp);
            }
        }
        p.setId(tem.getId().toString());
        return p;
    }

    public String updateProduct(ProductVO p) {//完成了
        if(p.getId()==null)
            throw TomatoMallException.NoEnoughArguments();

        Product tem=productRepository.findById(Integer.parseInt(p.getId())).get();

        if(p.getTitle()!=null)
            tem.setTitle(p.getTitle());
        if(p.getPrice()!=null)
            tem.setPrice(p.getPrice());
        if(p.getRate()!=null)
            tem.setRate(p.getRate());
        if(p.getDescription()!=null)
            tem.setDescription(p.getDescription());
        if(p.getCover()!=null)
            tem.setCover(p.getCover());
        if(p.getDetail()!=null)
            tem.setDetail(p.getDetail());

        productRepository.save(tem);
        for(Specification s:specificationRepository.findByProductId(Integer.parseInt(p.getId()))){
            specificationRepository.delete(s);
        }
        if(p.getSpecifications()!=null)
            for(SpecificationVO s:p.getSpecifications()){
                specificationRepository.save(s.toPO());
            }
        return "更新成功";
    }

    public String updateAmount(Integer id,Integer amount){//完成
        if(amount<0)
            throw TomatoMallException.InvaildProductAmount();
        ProductAmount p=productAmountRepository.findByProductId(id);
        if(p==null)
            throw TomatoMallException.ProductNotFound();
        p.setAmount(amount);
        productAmountRepository.save(p);
        return "调整库存成功";
    }

    public List<ProductVO> searchForSomething(String something){
        List<Product> ls=productRepository.findByTitleContainingOrDescriptionContainingOrCoverContainingOrDetailContaining(something,something,something,something);
        List<ProductVO> ans=new ArrayList<>();
        for(Product p:ls){
            ans.add(p.toVO());
        }
        return ans;
    }

    public List<ProductVO> getByCategory(String cate){
        List<Product> ls=productRepository.findByCategory(cate);
        List<ProductVO> ans=new ArrayList<>();
        for(Product p:ls){
           ans.add(p.toVO());
        }
        return ans;
    }

    public String addComment(CommentVO c){
        if(c.getUserId()==null || c.getProductId()==null)
            throw TomatoMallException.NoEnoughArguments();
        Comment cm=commentRepository.findByUserIdAndProductId(c.getUserId(),c.getProductId());
        if(cm==null){
            commentRepository.save(c.toPO());
            return "添加评论成功";
        }
        else{
            cm.setDetail(c.getDetail());
            commentRepository.save(cm);
            return "修改评论成功";
        }
    }

    public List<CommentVO> findByProductId(Integer id){
        List<Comment> ls=commentRepository.findByProductId(id);
        List<CommentVO> ans=new ArrayList<>();
        for(Comment c:ls){
            ans.add(c.toVO());
        }
        return ans;
    }

    public String deleteComment(CommentVO c){
        if(c.getUserId()==null || c.getProductId()==null)
            throw TomatoMallException.NoEnoughArguments();
        Comment cm=commentRepository.findByUserIdAndProductId(c.getUserId(),c.getProductId());
        if(cm!=null){
            commentRepository.delete(cm);
            return "删除成功";
        }
        else{
            throw TomatoMallException.CommentNotFound();
        }
    }

    public String updateComment(CommentVO c,Integer id){
        if(c.getUserId()==null || c.getProductId()==null)
            throw TomatoMallException.NoEnoughArguments();
        Comment cm=commentRepository.findById(id).get();
        cm.setDetail(c.getDetail());
        commentRepository.save(cm);
        return "修改成功";
    }
    public ProductVO likeProduct(int productId) {
        Product product = (Product)this.productRepository.findById(productId).orElseThrow(() -> new RuntimeException("商品不存在"));
        product.setLikes(product.getLikes() + 1);
        this.productRepository.save(product);
        return product.toVO();
    }
    public String evaluate(Integer id, Integer score) {
        // 获取当前登录用户
        Account account = securityUtil.getCurrentUser();
        if (account == null) {
            throw TomatoMallException.notLogin();
        }

        // 获取商品信息，为空则抛异常
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new TomatoMallException("商品不存在"));

        // 查询该用户是否已经评过该商品
        Evaluate evaluate = evaluateRepository.findByProductIdAndUserId(id, account.getId());

        boolean isNewEvaluation = false;

        if (evaluate == null) {
            evaluate = new Evaluate();
            evaluate.setUserId(account.getId());
            evaluate.setProductId(id);
            evaluate.setScore(score);
            evaluateRepository.save(evaluate);

            int currentScoreNum = product.getScoreNum() == null ? 0 : product.getScoreNum();
            double currentScore = product.getScore() == null ? 0 : product.getScore();

            product.setScoreNum(currentScoreNum + 1);
            product.setScore((currentScore * currentScoreNum + score) / (currentScoreNum + 1));
            isNewEvaluation = true;
        } else {
            int currentScoreNum = product.getScoreNum() == null ? 0 : product.getScoreNum();
            double currentScore = product.getScore() == null ? 0 : product.getScore();

            int oldScore = evaluate.getScore();

            double total = currentScore * currentScoreNum;
            total = total - oldScore + score;
            product.setScore(total / currentScoreNum);

            evaluate.setScore(score);
            isNewEvaluation = false;
        }

        productRepository.save(product);

        return isNewEvaluation ? "评分成功" : "评分修改成功";
    }

}



