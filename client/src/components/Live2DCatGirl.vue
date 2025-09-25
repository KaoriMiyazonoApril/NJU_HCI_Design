<!-- src/components/Live2DCatGirl.vue -->
<template>
  <div id="live2d-container">
    <div id="dialog-box"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'

// 然后使用 PIXI 和 Live2DModel 创建模型
onMounted(() => {
  const container = document.getElementById('live2d-container')
  const dialogBox = document.getElementById('dialog-box')

  // 使用公开的在线模型资源
  const modelUrl = 'https://www.live2d.com/download/sample-data/assets/hiyori/hiyori.model3.json'

  // 确保 PIXI 和 Live2DModel 已经加载
  if (typeof window.PIXI === 'undefined' || typeof window.Live2DModel === 'undefined') {
    console.error('PIXI or Live2DModel is not defined.')
    return
  }

  // 创建模型
  window.Live2DModel.from(modelUrl).then(model => {
    model.scale.set(0.4)
    model.position.set(150, 300)

    // 添加点击事件
    model.on('click', () => {
      const messages = [
        '喵～欢迎回来！',
        '需要帮忙找东西吗？',
        '今天天气真好，适合逛逛哦~',
        '有我在，请放心购物！',
        '遇到问题了吗？告诉我吧！'
      ]
      const msg = messages[Math.floor(Math.random() * messages.length)]
      showMessageBox(msg)
    })

    // 创建 PIXI 应用并添加模型
    const app = new window.PIXI.Application({
      width: 300,
      height: 400,
      transparent: true,
      view: document.createElement('canvas')
    })
    app.stage.addChild(model)
    container.appendChild(app.view)
  })

  function showMessageBox(message) {
    dialogBox.textContent = message
    dialogBox.style.display = 'block'
    setTimeout(() => {
      dialogBox.style.display = 'none'
    }, 3000)
  }
})
</script>

<style scoped>
#live2d-container {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 300px;
  height: 400px;
  z-index: 9999;
}

#dialog-box {
  display: none;
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  border-radius: 12px;
  font-size: 14px;
  max-width: 200px;
  text-align: center;
  z-index: 10000;
  animation: fadeOut 3s ease-out forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}
</style>