#!/bin/bash
BASE="/Users/gigi/.openclaw/workspace/shared/she-is-app"

STITCH_HEAD='<!DOCTYPE html>
<html class="light" lang="zh-CN">
<head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<TITLE_PLACEHOLDER>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
tailwind.config={darkMode:"class",theme:{extend:{colors:{"surface-container":"#f0edea","outline-variant":"#ccc4d1","on-primary":"#ffffff","background":"#fcf9f6","surface-container-low":"#f6f3f0","on-surface":"#1c1c1a","outline":"#7b7580","surface-container-highest":"#e5e2df","primary":"#33185c","surface-dim":"#dcdad7","surface-container-high":"#eae8e5","on-surface-variant":"#4a454f","surface-container-lowest":"#ffffff","primary-fixed":"#ecdcff","on-primary-container":"#b99ce7","primary-fixed-dim":"#d6baff","surface-variant":"#e5e2df","secondary":"#9c3c62","surface":"#fcf9f6","primary-container":"#4a3073","on-background":"#1c1c1a"},fontFamily:{"headline":["Noto Serif","Noto Serif SC","serif"],"body":["Plus Jakarta Sans","Noto Serif SC","sans-serif"],"label":["Plus Jakarta Sans","sans-serif"]},borderRadius:{"DEFAULT":"1rem","lg":"2rem","xl":"3rem","full":"9999px"}}}}
</script>
<style>
.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24}
body{min-height:max(884px,100dvh);-webkit-font-smoothing:antialiased}
.editorial-shadow{box-shadow:0 32px 64px -12px rgba(28,28,26,0.08)}
.glass-player{background:rgba(255,255,255,0.7);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
.dialogue{border-left:3px solid #d6baff;padding-left:1.25rem;margin-left:0;color:#33185c;font-style:italic}
article>section+section::before{content:"";display:block;width:3rem;height:1px;background:#ccc4d1;margin:0 auto 3rem}
</style>
</head>'

echo "Script loaded, BASE=$BASE"
echo "STITCH_HEAD length: ${#STITCH_HEAD}"
