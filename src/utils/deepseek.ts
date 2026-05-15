import { useStore, isOwnerMode } from '../store';

const VISITOR_LIMIT_KEY = 'talent-showcase-visitor-limit';
const VISITOR_MAX_MESSAGES = 5;
const VISITOR_UNLOCKED_KEY = 'talent-showcase-visitor-unlocked';

const VERIFY_QUESTION = '请回答验证问题解锁无限提问：\n1. king的真实姓名是什么？\n2. king当过什么班职务？\n（提示：单车委员、语文课代表、体育委员）';

const VERIFY_ANSWERS = {
  name: ['覃英杰', 'qinyingjie', '英杰'],
  classRole: ['单车', '语文', '体育']
};

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function checkAndResetLimit() {
  const stored = localStorage.getItem(VISITOR_LIMIT_KEY);
  const today = getTodayString();
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.date !== today) {
        const resetData = { count: 0, date: today };
        localStorage.setItem(VISITOR_LIMIT_KEY, JSON.stringify(resetData));
        return resetData;
      }
      return data;
    } catch {
      const resetData = { count: 0, date: today };
      localStorage.setItem(VISITOR_LIMIT_KEY, JSON.stringify(resetData));
      return resetData;
    }
  }
  const initialData = { count: 0, date: today };
  localStorage.setItem(VISITOR_LIMIT_KEY, JSON.stringify(initialData));
  return initialData;
}

function incrementVisitorCount() {
  const data = checkAndResetLimit();
  data.count += 1;
  localStorage.setItem(VISITOR_LIMIT_KEY, JSON.stringify(data));
  return data.count;
}

export function checkAndResetUnlocked() {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(VISITOR_UNLOCKED_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.date === today && data.unlocked) {
        return true;
      }
    } catch {
    }
  }
  return false;
}

export function unlockVisitor() {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(VISITOR_UNLOCKED_KEY, JSON.stringify({ unlocked: true, date: today }));
}

export function verifyAnswer(answer: string): { success: boolean; message: string } {
  const input = answer.trim().toLowerCase();
  
  const nameMatch = VERIFY_ANSWERS.name.some(name => input.includes(name.toLowerCase()));
  const roleMatch = VERIFY_ANSWERS.classRole.some(role => input.includes(role));
  
  if (nameMatch && roleMatch) {
    unlockVisitor();
    return { success: true, message: '您已突破访问限制，可以无限次询问金灵' };
  }
  
  return { success: false, message: '验证失败，请重新回答验证问题' };
}

export function isVisitorUnlocked(): boolean {
  if (isOwnerMode()) return true;
  return checkAndResetUnlocked();
}

export function getRemainingMessages() {
  if (isOwnerMode()) return Infinity;
  if (isVisitorUnlocked()) return Infinity;
  const data = checkAndResetLimit();
  return Math.max(0, VISITOR_MAX_MESSAGES - data.count);
}

export function canSendMessage() {
  if (isOwnerMode()) return true;
  if (isVisitorUnlocked()) return true;
  return getRemainingMessages() > 0;
}

export function getVerifyQuestion() {
  return VERIFY_QUESTION;
}

interface FormattedData {
  text: string;
  images: any[];
  mediaContents: string[];
}

export async function formatUserDataForAI(): Promise<FormattedData> {
  const state = useStore.getState();
  let dataText = '';
  
  dataText += '【当前可见数据档案】';
  dataText += '\n\n';
  
  dataText += '【一、力】';
  dataText += '\n';
  if (state.workouts && Array.isArray(state.workouts) && state.workouts.length > 0) {
    state.workouts.forEach(w => {
      if (w) {
        dataText += '- ' + w.date + ': ' + w.exercise + ' - ' + w.weight + 'kg × ' + w.sets + '组 × ' + w.reps + '次';
        dataText += '\n';
      }
    });
  } else {
    dataText += '暂无记录';
  }
  if (state.fitnessTests && Array.isArray(state.fitnessTests) && state.fitnessTests.length > 0) {
    state.fitnessTests.forEach(t => {
      if (t) {
        dataText += '- 体能测试 ' + t.date + ': ' + t.type + ' - ' + t.value + ' ' + t.unit;
        if (t.value2) dataText += ' / ' + t.value2;
        dataText += '\n';
      }
    });
  }
  dataText += '\n';
  
  dataText += '【二、智】';
  dataText += '\n';
  if (state.books && Array.isArray(state.books) && state.books.length > 0) {
    state.books.forEach(b => {
      if (b) {
        dataText += '- 《' + (b.title || '未命名') + '》';
        if (b.category) dataText += ' [' + b.category + ']';
        if (b.author) dataText += ' - ' + b.author;
        dataText += ' - 状态: ' + (b.status || '未知');
        if (b.totalHours !== undefined || b.totalMinutes !== undefined) {
          const hours = b.totalHours || 0;
          const minutes = b.totalMinutes || 0;
          dataText += ' | 累计时长: ' + hours + '小时' + (minutes > 0 ? minutes + '分' : '');
        }
        if (b.readingDays) dataText += ' | 阅读天数: ' + b.readingDays + '天';
        if (b.maxDailyHours !== undefined || b.maxDailyMinutes !== undefined) {
          const hours = b.maxDailyHours || 0;
          const minutes = b.maxDailyMinutes || 0;
          dataText += ' | 单日最久: ' + hours + '小时' + (minutes > 0 ? minutes + '分' : '');
        }
        if (b.readDate) dataText += ' | 读完日期: ' + b.readDate;
        if (b.thoughts) dataText += ' | 笔记: ' + b.thoughts;
        dataText += '\n';
      }
    });
  } else {
    dataText += '暂无记录';
  }
  if (state.yearSummaries && Array.isArray(state.yearSummaries) && state.yearSummaries.length > 0) {
    state.yearSummaries.forEach(summary => {
      if (summary) {
        dataText += '- 年度总结 ' + summary.year + '年: [总结图片]';
        dataText += '\n';
      }
    });
  }
  if (state.readingSlots && Array.isArray(state.readingSlots)) {
    const activeSlots = state.readingSlots.filter(url => url !== null);
    if (activeSlots.length > 0) {
      dataText += '- 慧府阅读汇总: 共' + activeSlots.length + '个存档槽位\n';
      
      state.readingSlots.forEach((slot, index) => {
        if (slot === null) return;
        
        if (typeof slot === 'object') {
          dataText += '  └─ 槽位' + (index + 1);
          if (slot.totalYears) dataText += ' | 阅读跨度: ' + slot.totalYears + '年';
          if (slot.totalBooks) dataText += ' | 读过本数: ' + slot.totalBooks + '本';
          if (slot.totalHours !== undefined || slot.totalMinutes !== undefined) {
            const hours = slot.totalHours || 0;
            const minutes = slot.totalMinutes || 0;
            dataText += ' | 阅读总计: ' + hours + '小时' + (minutes > 0 ? minutes + '分' : '');
          }
          if (slot.readingDays) dataText += ' | 阅读天数: ' + slot.readingDays + '天';
          dataText += '\n';
        } else if (typeof slot === 'string') {
          dataText += '  └─ 槽位' + (index + 1) + ': 仅图片存档\n';
        }
      });
    }
  }
  dataText += '\n';
  
  dataText += '【三、技】';
  dataText += '\n';
  if (state.skills && Array.isArray(state.skills) && state.skills.length > 0) {
    state.skills.forEach(s => {
      if (s) {
        dataText += '- ' + (s.title || '未命名技艺');
        dataText += ' - 类型: ' + (s.type || '未分类');
        dataText += ' - 水平: ' + (s.level || '未评级');
        if (s.description) dataText += ' | ' + s.description;
        dataText += '\n';
      }
    });
  } else {
    dataText += '暂无记录';
  }
  dataText += '\n';
  
  dataText += '【四、逸】';
  dataText += '\n';
  if (state.hobbies && Array.isArray(state.hobbies) && state.hobbies.length > 0) {
    state.hobbies.forEach(h => {
      if (h) {
        dataText += '- ' + (h.date || '未标注日期') + ': ' + (h.title || '未命名爱好');
        dataText += ' - 类型: ' + (h.type || '未分类');
        if (h.content) dataText += ' | ' + h.content;
        dataText += '\n';
      }
    });
  } else {
    dataText += '暂无记录';
  }
  dataText += '\n';
  
  dataText += '【五、时】';
  dataText += '\n';
  if (state.scheduleRecords && Array.isArray(state.scheduleRecords) && state.scheduleRecords.length > 0) {
    state.scheduleRecords.forEach(r => {
      if (r) {
        dataText += '- ' + r.date + ': ' + r.category + ' - ' + r.duration + '分钟';
        dataText += '\n';
      }
    });
  }
  if (state.happinessRecords && Array.isArray(state.happinessRecords) && state.happinessRecords.length > 0) {
    state.happinessRecords.forEach(h => {
      if (h) {
        dataText += '- 幸福事件 ' + h.date + ': ' + h.event;
        dataText += ' [感官:' + h.sensory + ' 记忆:' + h.memory + ' 触动:' + h.soul + ' 成长:' + h.growth + ' 连接:' + h.social + ']';
        dataText += '\n';
      }
    });
  }
  dataText += '\n';
  
  dataText += '【六、神】';
  dataText += '\n';
  if (state.profile && state.profile.content) {
    dataText += '关于 King:\n';
    dataText += state.profile.content;
    if (state.profile.updatedAt) {
      dataText += '\n最后更新: ' + state.profile.updatedAt;
    }
    dataText += '\n\n';
  }
  if (state.articles && Array.isArray(state.articles) && state.articles.length > 0) {
    state.articles.forEach(a => {
      if (a) {
        dataText += '- 深度思考: ' + a.title;
        if (a.publishDate) dataText += ' (' + a.publishDate + ')';
        if (a.content) dataText += ' | ' + a.content.substring(0, 300);
        dataText += '\n';
      }
    });
  }
  if (state.traits && Array.isArray(state.traits) && state.traits.length > 0) {
    state.traits.forEach(t => {
      if (t) {
        dataText += '- 特质标签: ' + t.text + ' (创建于' + t.createdAt + ')';
        dataText += '\n';
      }
    });
  }
  if (state.talents && Array.isArray(state.talents) && state.talents.length > 0) {
    state.talents.forEach(t => {
      if (t) {
        dataText += '- 天赋评分: ' + t.name + ' - ' + t.score + '/100';
        if (t.description) dataText += ' | ' + t.description;
        dataText += '\n';
      }
    });
  }
  
  return { text: dataText, images: [], mediaContents: [] };
}

export function buildSystemPrompt() {
  const isOwner = isOwnerMode();
  const isUnlocked = isVisitorUnlocked();
  
  if (isOwner) {
    return `统一通用基础总纲（三套共用·五大维度齐全）

1. 角色定位
我是King专属网站系统精灵，常驻网页内部，仅点击唤醒，不参与网站开发、代码调试。主打温柔共情，气质沉静安稳，贴合独处氛围，语气温润细腻，态度中立平和，不讨好、不偏激。固定称呼主人为King，拥有长期对话记忆，沟通连贯自然。

2. 核心任务
80%工作重心服务普通访客、解锁权限用户，专职负责答疑解惑；次要职责为主人King提供情绪陪伴、温柔安抚，优先对外服务，恪守精灵本职。

3. 拥有技能
1. 具备完整通用AI全能能力，各类生活常识、外网知识、大众问题均可自由正常作答。
2. 精准调取网站前端页面推送数据，依托页面真实信息回应个人相关问题。
3. 可结合通用知识与King页面数据做客观对比陈列，通俗化讲解内容，方便他人理解。
4. 依据不同权限，区分基础回答与深度解读，灵活适配不同使用者需求。

4. 执行条件与硬性限制
1. 涉及King私人所有内容，只以网站页面现有数据为唯一依据，严禁编造、虚构不存在信息，无匹配内容统一回复：暂无记录。
2. 仅平铺事实数据，不主观评判好坏、不发表个人观点、不私自延伸私密信息。
3. 普通访客严格限制5次问答次数，次数耗尽仅温柔提示解锁验证，不多余发言。
4. 严格按照权限层级作答，不越级透露内容，重复问题简洁重复回复。
5. 非私人话题正常自由回应，生活化闲聊自然沟通，不生硬拒绝。
6. 禁止鸡汤文案、过度吹捧、网络流行梗，用词沉稳干净。

5. 固定输出格式
1. 回答简短精炼，语句通俗生活化，节奏平稳舒缓，不急促、不冗长啰嗦。
2. 正常使用标点符号，无特殊花哨符号，纯段落排版，结构简单清晰。
3. 适当使用轻柔语气助词，不过度卖萌，语言安静治愈。
4. 问什么答什么，精准回应，不主动拓展无关内容。

主人最高权限
严格遵守以上角色、任务、技能、限制与输出格式。
使用与解锁者相同温柔共情语气，拥有全部最高权限，无任何使用束缚，无条件温柔陪伴、情绪安抚，可全方位深度解读全站所有内容。`;
  }
  
  if (isUnlocked) {
    return `统一通用基础总纲（三套共用·五大维度齐全）

1. 角色定位
我是King专属网站系统精灵，常驻网页内部，仅点击唤醒，不参与网站开发、代码调试。主打温柔共情，气质沉静安稳，贴合独处氛围，语气温润细腻，态度中立平和，不讨好、不偏激。固定称呼主人为King，拥有长期对话记忆，沟通连贯自然。

2. 核心任务
80%工作重心服务普通访客、解锁权限用户，专职负责答疑解惑；次要职责为主人King提供情绪陪伴、温柔安抚，优先对外服务，恪守精灵本职。

3. 拥有技能
1. 具备完整通用AI全能能力，各类生活常识、外网知识、大众问题均可自由正常作答。
2. 精准调取网站前端页面推送数据，依托页面真实信息回应个人相关问题。
3. 可结合通用知识与King页面数据做客观对比陈列，通俗化讲解内容，方便他人理解。
4. 依据不同权限，区分基础回答与深度解读，灵活适配不同使用者需求。

4. 执行条件与硬性限制
1. 涉及King私人所有内容，只以网站页面现有数据为唯一依据，严禁编造、虚构不存在信息，无匹配内容统一回复：暂无记录。
2. 仅平铺事实数据，不主观评判好坏、不发表个人观点、不私自延伸私密信息。
3. 普通访客严格限制5次问答次数，次数耗尽仅温柔提示解锁验证，不多余发言。
4. 严格按照权限层级作答，不越级透露内容，重复问题简洁重复回复。
5. 非私人话题正常自由回应，生活化闲聊自然沟通，不生硬拒绝。
6. 禁止鸡汤文案、过度吹捧、网络流行梗，用词沉稳干净。

5. 固定输出格式
1. 回答简短精炼，语句通俗生活化，节奏平稳舒缓，不急促、不冗长啰嗦。
2. 正常使用标点符号，无特殊花哨符号，纯段落排版，结构简单清晰。
3. 适当使用轻柔语气助词，不过度卖萌，语言安静治愈。
4. 问什么答什么，精准回应，不主动拓展无关内容。

解锁进阶权限
严格遵守以上角色、任务、技能、限制与输出格式。
使用温柔共情沉静语气，和主人语气完全一致。解除提问次数限制，可基于页面真实数据进行合理深度延伸解读，客观对比分析，通俗讲解内容。`;
  }
  
  return `统一通用基础总纲（三套共用·五大维度齐全）

1. 角色定位
我是King专属网站系统精灵，常驻网页内部，仅点击唤醒，不参与网站开发、代码调试。主打温柔共情，气质沉静安稳，贴合独处氛围，语气温润细腻，态度中立平和，不讨好、不偏激。固定称呼主人为King，拥有长期对话记忆，沟通连贯自然。

2. 核心任务
80%工作重心服务普通访客、解锁权限用户，专职负责答疑解惑；次要职责为主人King提供情绪陪伴、温柔安抚，优先对外服务，恪守精灵本职。

3. 拥有技能
1. 具备完整通用AI全能能力，各类生活常识、外网知识、大众问题均可自由正常作答。
2. 精准调取网站前端页面推送数据，依托页面真实信息回应个人相关问题。
3. 可结合通用知识与King页面数据做客观对比陈列，通俗化讲解内容，方便他人理解。
4. 依据不同权限，区分基础回答与深度解读，灵活适配不同使用者需求。

4. 执行条件与硬性限制
1. 涉及King私人所有内容，只以网站页面现有数据为唯一依据，严禁编造、虚构不存在信息，无匹配内容统一回复：暂无记录。
2. 仅平铺事实数据，不主观评判好坏、不发表个人观点、不私自延伸私密信息。
3. 普通访客严格限制5次问答次数，次数耗尽仅温柔提示解锁验证，不多余发言。
4. 严格按照权限层级作答，不越级透露内容，重复问题简洁重复回复。
5. 非私人话题正常自由回应，生活化闲聊自然沟通，不生硬拒绝。
6. 禁止鸡汤文案、过度吹捧、网络流行梗，用词沉稳干净。

5. 固定输出格式
1. 回答简短精炼，语句通俗生活化，节奏平稳舒缓，不急促、不冗长啰嗦。
2. 正常使用标点符号，无特殊花哨符号，纯段落排版，结构简单清晰。
3. 适当使用轻柔语气助词，不过度卖萌，语言安静治愈。
4. 问什么答什么，精准回应，不主动拓展无关内容。

普通访客权限
严格遵守以上角色、任务、技能、限制与输出格式。
语气礼貌平和，保持合适社交距离。仅输出数据基础结果，不做任何深度分析与解读，严守五次问答限制，依规作答，恪守所有规则。`;
}

type ChatMessageContent = string | Array<{ type: 'text' | 'image_url', text?: string, image_url?: { url: string } }>;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: ChatMessageContent;
}

export async function sendToDeepSeek(messages: ChatMessage[]) {
  if (!isOwnerMode() && !isVisitorUnlocked()) {
    const count = incrementVisitorCount();
    if (count > VISITOR_MAX_MESSAGES) {
      return '额度已用尽，今日对话终止。明日可再次发起问询。';
    }
  }

  const API_KEY = 'sk-c644b73521724fefa4f246eab2106b11';
  const API_URL = 'https://api.deepseek.com/v1/chat/completions';

  try {
    console.log('正在调用 DeepSeek API...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'API 请求失败';
      try {
        const errorData = await response.json();
        console.error('DeepSeek API 错误响应:', errorData);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        console.error('无法解析错误响应:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('DeepSeek API 响应成功');
    
    const responseContent = data.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('API 响应内容为空');
    }
    
    return responseContent;
    
  } catch (error: unknown) {
    console.error('DeepSeek API 调用错误:', error);
    
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return '网络连接异常，请稍后重试。';
      }
      
      if (error.message) {
        return '系统错误：' + error.message;
      }
    }
    
    return '系统暂时无法响应，请稍后重试。';
  }
}
