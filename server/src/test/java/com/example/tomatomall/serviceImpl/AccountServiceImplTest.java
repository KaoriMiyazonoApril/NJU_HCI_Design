package com.example.tomatomall.serviceImpl;

import com.example.tomatomall.exception.TomatoMallException;
import com.example.tomatomall.po.Account;
import com.example.tomatomall.po.Comment;
import com.example.tomatomall.po.Product;
import com.example.tomatomall.repository.AccountRepository;
import com.example.tomatomall.repository.CommentRepository;
import com.example.tomatomall.repository.ProductRepository;
import com.example.tomatomall.service.AccountService;
import com.example.tomatomall.vo.AccountVO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AccountServiceImplTest {

    @Autowired
    private AccountService accountService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CommentRepository commentRepository;

    @Test
    void testGetUserByUsername_Success() {
        for(Account a:accountRepository.findAll()){
            System.out.println(a.getUsername());
        }
    }

    @Test
    void testGetUserByUsername_UserNotFound() {
        assertThrows(TomatoMallException.class, () -> {
            accountService.getUserByUsername("nonExistingUser");
        });
    }

//    @Test
//    void addUsers(){
//        String username = "user";
//        for(int i=0;i<10;i++){
//            Account account = new Account();
//            account.setUsername(username+i);
//            account.setPassword(passwordEncoder.encode("123456"));
//            account.setRole("USER");
//            account.setLocation("suzhou");
//            accountRepository.save(account);
//        }
//    }
//
//    @Test
//    void deleteUsers(){
//        for(Account account:accountRepository.findAll()){
//            if(account.getRole().equals("USER")){
//                accountRepository.delete(account);
//            }
//        }
//    }
//
//    @Test
//    void addComments(){
//        final Integer USER_COUNT=10;
//        Random RAND = new Random();
//
//        for(Product product:productRepository.findAll()){
//            Double score = product.getRate();
//            if(score==null){
//                continue;
//            }
//            if(!Double.isNaN(score) && !Double.isInfinite(score)){
//                Integer scoreSum= (int) (score*10);
//
//                // scoreSum 合法范围检查（10 ~ 50）
//                if (scoreSum < USER_COUNT || scoreSum > 5 * USER_COUNT) {
//                    System.out.printf("Product %d: scoreSum=%d 越界，跳过%n", product.getId(), scoreSum);
//                    continue;
//                }
//
//                // 枚举所有满足条件的非负整数组合 x1..x5
//                List<int[]> solutions = new ArrayList<>();
//                for (int x1 = 0; x1 <= USER_COUNT; x1++) {
//                    for (int x2 = 0; x2 <= USER_COUNT - x1; x2++) {
//                        for (int x3 = 0; x3 <= USER_COUNT - x1 - x2; x3++) {
//                            for (int x4 = 0; x4 <= USER_COUNT - x1 - x2 - x3; x4++) {
//                                int x5 = USER_COUNT - x1 - x2 - x3 - x4;
//                                // 检查加权和是否等于 scoreSum
//                                int weighted = 1*x1 + 2*x2 + 3*x3 + 4*x4 + 5*x5;
//                                if (weighted == scoreSum) {
//                                    solutions.add(new int[]{x1, x2, x3, x4, x5});
//                                }
//                            }
//                        }
//                    }
//                }
//
//                if (solutions.isEmpty()) {
//                    System.out.printf("Product %d: 无解 (scoreSum=%d)%n", product.getId(), scoreSum);
//                    continue;
//                }
//
//                // 随机选择一个解
//                int[] chosen = solutions.get(RAND.nextInt(solutions.size()));
//                System.out.printf("Product %d: 选中解 x1..x5 = %s (scoreSum=%d)%n",
//                        product.getId(), Arrays.toString(chosen), scoreSum);
//
//                // 把计数展开成具体的 10 个评分（例如 {x1=2, x2=3, ...} -> [1,1,2,2,2,3,...]）
//                List<Integer> scores = new ArrayList<>(USER_COUNT);
//                for (int k = 0; k < chosen[0]; k++) scores.add(1);
//                for (int k = 0; k < chosen[1]; k++) scores.add(2);
//                for (int k = 0; k < chosen[2]; k++) scores.add(3);
//                for (int k = 0; k < chosen[3]; k++) scores.add(4);
//                for (int k = 0; k < chosen[4]; k++) scores.add(5);
//
//                // 保护性检查
//                if (scores.size() != USER_COUNT) {
//                    System.out.printf("内部错误：展开后评分数量 %d 不等于 %d%n", scores.size(), USER_COUNT);
//                    continue;
//                }
//
//                // 打乱顺序，使分配给 userId 更随机
//                Collections.shuffle(scores, RAND);
//
//                // 可选的评论模板
//                String[] templates = {
//                        "挺不错的商品，推荐！",
//                        "质量一般，下次再考虑。",
//                        "性价比不错。",
//                        "包装完好，物流快速。",
//                        "有点小缺陷，但总体满意。"
//                };
//
//                // 插入 10 条评论到数据库，userId 假设为 1..10，username 为 user1..user10
//                for (int i = 0; i < USER_COUNT; i++) {
//                    int userId = i + 30021;
//                    int userScore = scores.get(i);
//
//                    Comment comment = new Comment();
//                    comment.setUserId(userId);
//                    comment.setUsername("user" + userId);
//                    comment.setProductId(product.getId());
//                    String detail = templates[RAND.nextInt(templates.length)];
//                    comment.setDetail(detail);
//
//                    commentRepository.save(comment);
//                }
//
//            }
//        }
//    }
}