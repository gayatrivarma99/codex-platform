/**
 * Realistic seed data for Codex Platform
 */

const achievementsData = [
  {
    code: 'first_problem',
    title: 'First Step',
    description: 'Successfully solved your first coding problem on Codex.',
    icon: 'Award',
    category: 'problems',
    criteria: { type: 'problems_solved', target: 1 },
  },
  {
    code: 'solved_5',
    title: 'Code Apprentice',
    description: 'Solved 5 algorithmic coding challenges.',
    icon: 'Zap',
    category: 'problems',
    criteria: { type: 'problems_solved', target: 5 },
  },
  {
    code: 'solved_10',
    title: 'Problem Solver',
    description: 'Solved 10 algorithmic coding challenges.',
    icon: 'Target',
    category: 'problems',
    criteria: { type: 'problems_solved', target: 10 },
  },
  {
    code: 'solved_50',
    title: 'Master of Algorithms',
    description: 'Solved 50 coding problems across various topics.',
    icon: 'Trophy',
    category: 'problems',
    criteria: { type: 'problems_solved', target: 50 },
  },
  {
    code: 'streak_3',
    title: 'On Fire',
    description: 'Maintained a 3-day daily problem solving streak.',
    icon: 'Flame',
    category: 'streak',
    criteria: { type: 'streak_days', target: 3 },
  },
  {
    code: 'streak_7',
    title: 'Unstoppable Momentum',
    description: 'Maintained a 7-day daily problem solving streak.',
    icon: 'Flame',
    category: 'streak',
    criteria: { type: 'streak_days', target: 7 },
  },
  {
    code: 'contest_first',
    title: 'Arena Gladiator',
    description: 'Participated in your first live coding contest.',
    icon: 'Star',
    category: 'contest',
    criteria: { type: 'contests_joined', target: 1 },
  },
];

const problemsData = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    topics: ['Arrays', 'Hashing'],
    tags: ['Hash Table', 'Array'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order, or as space-separated indices.`,
    examples: [
      {
        input: '4\n2 7 11 15\n9',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 9, we return 0 1.',
      },
      {
        input: '3\n3 2 4\n6',
        output: '1 2',
        explanation: 'nums[1] + nums[2] == 6, we return 1 2.',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    inputFormat: 'Line 1: N (length of array)\nLine 2: N space-separated integers\nLine 3: target integer',
    outputFormat: 'Two space-separated indices (0-indexed)',
    hints: [
      'A brute force approach checks all pairs in O(N^2). Can you use a hash map to do it in O(N)?',
      'As you iterate through the array, check if target - current_element exists in your hash map.',
    ],
    editorial: `### Optimal Approach: Hash Map (O(N) Time, O(N) Space)
We iterate through the array while maintaining a hash map of elements we've seen so far. For each element \`num\` at index \`i\`, we check if \`target - num\` exists in the map. If it does, we return the stored index and \`i\`. Otherwise, we store \`num -> i\` in the map.`,
    starterCode: {
      javascript: `const fs = require('fs');

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (!input || input.length < 3) return;
  
  const n = parseInt(input[0]);
  const nums = [];
  for (let i = 0; i < n; i++) {
    nums.push(parseInt(input[1 + i]));
  }
  const target = parseInt(input[1 + n]);

  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      console.log(\`\${map.get(complement)} \${i}\`);
      return;
    }
    map.set(nums[i], i);
  }
}

solve();`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:1+n]]
    target = int(lines[1+n])
    
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    solve()`,
    },
    testCases: [
      {
        input: '4\n2 7 11 15\n9',
        expectedOutput: '0 1',
        isPublic: true,
      },
      {
        input: '3\n3 2 4\n6',
        expectedOutput: '1 2',
        isPublic: true,
      },
      {
        input: '2\n3 3\n6',
        expectedOutput: '0 1',
        isPublic: false,
      },
      {
        input: '5\n1 5 10 20 35\n30',
        expectedOutput: '2 3',
        isPublic: false,
      },
    ],
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    topics: ['Stack', 'Strings'],
    tags: ['Stack', 'String'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Output \`true\` if valid, or \`false\` if invalid.`,
    examples: [
      { input: '()', output: 'true', explanation: 'Matching round brackets.' },
      { input: '()[]{}', output: 'true', explanation: 'All pairs properly matched.' },
      { input: '(]', output: 'false', explanation: 'Mismatched closing bracket.' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only: ()[]{}'],
    inputFormat: 'A single string of brackets',
    outputFormat: 'true or false',
    hints: ['Use a Stack data structure to track opening brackets.'],
    editorial: 'Push open brackets onto a stack. When a closing bracket is encountered, pop from the stack and verify that it matches.',
    starterCode: {
      javascript: `const fs = require('fs');

function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else if (map[ch]) {
      if (stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}

const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isValid(input) ? 'true' : 'false');`,
      python: `import sys

def is_valid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in '({[':
            stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return False
    return len(stack) == 0

s = sys.stdin.read().strip()
print('true' if is_valid(s) else 'false')`,
    },
    testCases: [
      { input: '()', expectedOutput: 'true', isPublic: true },
      { input: '()[]{}', expectedOutput: 'true', isPublic: true },
      { input: '(]', expectedOutput: 'false', isPublic: true },
      { input: '([)]', expectedOutput: 'false', isPublic: false },
      { input: '{[]}', expectedOutput: 'true', isPublic: false },
    ],
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    topics: ['Arrays', 'Dynamic Programming'],
    tags: ['Greedy', 'Array'],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: '6\n7 1 5 3 6 4',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.',
      },
      { input: '5\n7 6 4 3 1', output: '0', explanation: 'No transactions are done and the max profit = 0.' },
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    inputFormat: 'Line 1: N\nLine 2: N space-separated stock prices',
    outputFormat: 'Single integer representing max profit',
    hints: ['Keep track of the minimum price seen so far and the max profit possible at each step.'],
    editorial: 'Single pass algorithm tracking `minPrice = min(minPrice, price)` and `maxProfit = max(maxProfit, price - minPrice)`.',
    starterCode: {
      javascript: `const fs = require('fs');

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (!input || input.length < 2) return;
  const n = parseInt(input[0]);
  const prices = input.slice(1, 1 + n).map(Number);
  
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) minPrice = price;
    else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
  }
  console.log(maxProfit);
}

solve();`,
      python: `import sys

lines = sys.stdin.read().split()
if lines:
    n = int(lines[0])
    prices = [int(x) for x in lines[1:1+n]]
    min_price = float('inf')
    max_profit = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > max_profit:
            max_profit = p - min_price
    print(max_profit)`,
    },
    testCases: [
      { input: '6\n7 1 5 3 6 4', expectedOutput: '5', isPublic: true },
      { input: '5\n7 6 4 3 1', expectedOutput: '0', isPublic: true },
      { input: '5\n2 4 1 8 3', expectedOutput: '7', isPublic: false },
      { input: '3\n1 2 3', expectedOutput: '2', isPublic: false },
    ],
  },
  {
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'Easy',
    topics: ['Two Pointers', 'Strings'],
    tags: ['String', 'Two Pointers'],
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      { input: 'A man, a plan, a canal: Panama', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 'race a car', output: 'false', explanation: '"raceacar" is not a palindrome.' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters.'],
    inputFormat: 'A string on a single line',
    outputFormat: 'true or false',
    hints: ['Two pointers starting from start and end moving towards center.'],
    editorial: 'Filter out non-alphanumerics or use two pointers with isalnum checks.',
    starterCode: {
      javascript: `const fs = require('fs');

const input = fs.readFileSync(0, 'utf-8').trim();
const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, '');
const rev = cleaned.split('').reverse().join('');
console.log(cleaned === rev ? 'true' : 'false');`,
      python: `import sys

s = sys.stdin.read().strip()
cleaned = [c.lower() for c in s if c.isalnum()]
print('true' if cleaned == cleaned[::-1] else 'false')`,
    },
    testCases: [
      { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true', isPublic: true },
      { input: 'race a car', expectedOutput: 'false', isPublic: true },
      { input: ' ', expectedOutput: 'true', isPublic: false },
      { input: '0P', expectedOutput: 'false', isPublic: false },
    ],
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    topics: ['Dynamic Programming', 'Arrays'],
    tags: ['Kadane Algorithm', 'Array', 'DP'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      {
        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
      },
      { input: '1\n1', output: '1', explanation: 'Single element subarray sum is 1.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    inputFormat: 'Line 1: N\nLine 2: N space-separated integers',
    outputFormat: 'A single integer representing the maximum subarray sum',
    hints: ["Consider Kadane's algorithm: keep a running sum, and reset to 0 if it dips below 0."],
    editorial: "Kadane's algorithm runs in O(N) time and O(1) space.",
    starterCode: {
      javascript: `const fs = require('fs');

function solve() {
  const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (!parts.length) return;
  const n = parseInt(parts[0]);
  const nums = parts.slice(1, 1 + n).map(Number);
  
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  console.log(maxSum);
}

solve();`,
      python: `import sys

parts = sys.stdin.read().split()
if parts:
    n = int(parts[0])
    nums = [int(x) for x in parts[1:1+n]]
    cur_sum = max_sum = nums[0]
    for x in nums[1:]:
        cur_sum = max(x, cur_sum + x)
        max_sum = max(max_sum, cur_sum)
    print(max_sum)`,
    },
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isPublic: true },
      { input: '1\n1', expectedOutput: '1', isPublic: true },
      { input: '5\n5 4 -1 7 8', expectedOutput: '23', isPublic: false },
      { input: '3\n-3 -2 -1', expectedOutput: '-1', isPublic: false },
    ],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    topics: ['Sliding Window', 'Strings'],
    tags: ['Sliding Window', 'Hash Table'],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      { input: 'abcabcbb', output: '3', explanation: 'The answer is "abc", with length 3.' },
      { input: 'bbbbb', output: '1', explanation: 'The answer is "b", with length 1.' },
      { input: 'pwwkew', output: '3', explanation: 'The answer is "wke", with length 3.' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    inputFormat: 'A string s',
    outputFormat: 'Single integer',
    hints: ['Use sliding window with two pointers left and right, and store last seen indices of characters.'],
    editorial: 'Sliding window with hash map storing character positions runs in O(N) time.',
    starterCode: {
      javascript: `const fs = require('fs');

function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (map.has(ch) && map.get(ch) >= left) {
      left = map.get(ch) + 1;
    }
    map.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

const s = fs.readFileSync(0, 'utf-8').replace(/[\\r\\n]/g, '');
console.log(lengthOfLongestSubstring(s));`,
      python: `import sys

s = sys.stdin.read().replace('\\r', '').replace('\\n', '')
seen = {}
max_len = 0
left = 0
for right, ch in enumerate(s):
    if ch in seen and seen[ch] >= left:
        left = seen[ch] + 1
    seen[ch] = right
    max_len = max(max_len, right - left + 1)
print(max_len)`,
    },
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3', isPublic: true },
      { input: 'bbbbb', expectedOutput: '1', isPublic: true },
      { input: 'pwwkew', expectedOutput: '3', isPublic: false },
      { input: 'abcdefg', expectedOutput: '7', isPublic: false },
    ],
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    topics: ['Two Pointers', 'Greedy'],
    tags: ['Two Pointers', 'Array'],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.`,
    examples: [
      { input: '9\n1 8 6 2 5 4 8 3 7', output: '49', explanation: 'Max area is between index 1 and 8: min(8, 7) * 7 = 49.' },
      { input: '2\n1 1', output: '1', explanation: 'min(1, 1) * 1 = 1.' },
    ],
    constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    inputFormat: 'Line 1: N\nLine 2: N space-separated heights',
    outputFormat: 'Max area as integer',
    hints: ['Place two pointers at the ends. Move the pointer pointing to the shorter line inward.'],
    editorial: 'Two pointers greedy approach guarantees optimal area in O(N).',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length > 1) {
  const n = parseInt(parts[0]);
  const h = parts.slice(1, 1 + n).map(Number);
  let l = 0, r = h.length - 1, maxArea = 0;
  while (l < r) {
    const area = Math.min(h[l], h[r]) * (r - l);
    if (area > maxArea) maxArea = area;
    if (h[l] < h[r]) l++;
    else r--;
  }
  console.log(maxArea);
}`,
      python: `import sys

parts = sys.stdin.read().split()
if parts:
    n = int(parts[0])
    h = [int(x) for x in parts[1:1+n]]
    l, r = 0, len(h) - 1
    max_area = 0
    while l < r:
        area = min(h[l], h[r]) * (r - l)
        if area > max_area:
            max_area = area
        if h[l] < h[r]:
            l += 1
        else:
            r -= 1
    print(max_area)`,
    },
    testCases: [
      { input: '9\n1 8 6 2 5 4 8 3 7', expectedOutput: '49', isPublic: true },
      { input: '2\n1 1', expectedOutput: '1', isPublic: true },
      { input: '5\n4 3 2 1 4', expectedOutput: '16', isPublic: false },
      { input: '4\n1 2 4 3', expectedOutput: '4', isPublic: false },
    ],
  },
  {
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    topics: ['Two Pointers', 'Arrays'],
    tags: ['Sorting', 'Two Pointers'],
    description: `Given an integer array nums, return the count of unique triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.`,
    examples: [
      { input: '6\n-1 0 1 2 -1 -4', output: '2', explanation: 'The triplets are [-1, 0, 1] and [-1, -1, 2]. Total count: 2.' },
      { input: '3\n0 1 1', output: '0', explanation: 'No triplet sums to 0.' },
    ],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    inputFormat: 'Line 1: N\nLine 2: N space-separated numbers',
    outputFormat: 'Count of unique triplets',
    hints: ['Sort the array first. Loop through element i, then use two pointers for j and k.'],
    editorial: 'Sort array in O(N log N) then two-pointer search for each index in O(N^2).',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length > 1) {
  const n = parseInt(parts[0]);
  const nums = parts.slice(1, 1 + n).map(Number).sort((a, b) => a - b);
  let count = 0;
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        count++;
        while (l < r && nums[l] === nums[l + 1]) l++;
        while (l < r && nums[r] === nums[r - 1]) r--;
        l++; r--;
      } else if (sum < 0) {
        l++;
      } else {
        r--;
      }
    }
  }
  console.log(count);
}`,
      python: `import sys

parts = sys.stdin.read().split()
if parts:
    n = int(parts[0])
    nums = sorted([int(x) for x in parts[1:1+n]])
    count = 0
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s == 0:
                count += 1
                while l < r and nums[l] == nums[l + 1]:
                    l += 1
                while l < r and nums[r] == nums[r - 1]:
                    r -= 1
                l += 1
                r -= 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    print(count)`,
    },
    testCases: [
      { input: '6\n-1 0 1 2 -1 -4', expectedOutput: '2', isPublic: true },
      { input: '3\n0 1 1', expectedOutput: '0', isPublic: true },
      { input: '3\n0 0 0', expectedOutput: '1', isPublic: false },
    ],
  },
  {
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'Medium',
    topics: ['Dynamic Programming'],
    tags: ['DP', 'Breadth-First Search'],
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.`,
    examples: [
      { input: '3 11\n1 2 5', output: '3', explanation: '11 = 5 + 5 + 1 (3 coins)' },
      { input: '1 3\n2', output: '-1', explanation: 'Amount 3 cannot be made with only 2s.' },
      { input: '1 0\n1', output: '0', explanation: '0 coins needed for amount 0.' },
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    inputFormat: 'Line 1: N (number of coins) and Amount\nLine 2: N space-separated coin values',
    outputFormat: 'Fewest coins or -1',
    hints: ['dp[i] represents minimum coins needed for amount i. dp[i] = min(dp[i], dp[i - coin] + 1)'],
    editorial: 'Bottom-up dynamic programming table of size amount + 1.',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length >= 2) {
  const n = parseInt(parts[0]);
  const amount = parseInt(parts[1]);
  const coins = parts.slice(2, 2 + n).map(Number);
  
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (i - c >= 0 && dp[i - c] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - c] + 1);
      }
    }
  }
  console.log(dp[amount] === Infinity ? -1 : dp[amount]);
}`,
      python: `import sys

parts = sys.stdin.read().split()
if len(parts) >= 2:
    n = int(parts[0])
    amount = int(parts[1])
    coins = [int(x) for x in parts[2:2+n]]
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if i - c >= 0:
                dp[i] = min(dp[i], dp[i - c] + 1)
    print(-1 if dp[amount] == float('inf') else dp[amount])`,
    },
    testCases: [
      { input: '3 11\n1 2 5', expectedOutput: '3', isPublic: true },
      { input: '1 3\n2', expectedOutput: '-1', isPublic: true },
      { input: '1 0\n1', expectedOutput: '0', isPublic: false },
      { input: '3 7\n1 3 4', expectedOutput: '2', isPublic: false },
    ],
  },
  {
    title: 'Search in Rotated Sorted Array',
    slug: 'search-in-rotated-sorted-array',
    difficulty: 'Medium',
    topics: ['Binary Search', 'Arrays'],
    tags: ['Binary Search', 'Array'],
    description: `Given the array \`nums\` after the possible rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      { input: '7 0\n4 5 6 7 0 1 2', output: '4', explanation: 'Target 0 is at index 4.' },
      { input: '7 3\n4 5 6 7 0 1 2', output: '-1', explanation: 'Target 3 is not in array.' },
    ],
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4', 'All values of nums are unique.'],
    inputFormat: 'Line 1: N and Target\nLine 2: N space-separated integers',
    outputFormat: 'Index of target or -1',
    hints: ['Check which half is sorted: left half nums[low] <= nums[mid] or right half.'],
    editorial: 'Modified binary search determining sorted half in O(log N).',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length >= 2) {
  const n = parseInt(parts[0]);
  const target = parseInt(parts[1]);
  const nums = parts.slice(2, 2 + n).map(Number);
  
  let low = 0, high = nums.length - 1;
  let ans = -1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) { ans = mid; break; }
    if (nums[low] <= nums[mid]) {
      if (nums[low] <= target && target < nums[mid]) high = mid - 1;
      else low = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[high]) low = mid + 1;
      else high = mid - 1;
    }
  }
  console.log(ans);
}`,
      python: `import sys

parts = sys.stdin.read().split()
if len(parts) >= 2:
    n = int(parts[0])
    target = int(parts[1])
    nums = [int(x) for x in parts[2:2+n]]
    low, high = 0, len(nums) - 1
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            ans = mid
            break
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            if nums[mid] < target <= nums[high]:
                low = mid + 1
            else:
                high = mid - 1
    print(ans)`,
    },
    testCases: [
      { input: '7 0\n4 5 6 7 0 1 2', expectedOutput: '4', isPublic: true },
      { input: '7 3\n4 5 6 7 0 1 2', expectedOutput: '-1', isPublic: true },
      { input: '1 0\n0', expectedOutput: '0', isPublic: false },
    ],
  },
  {
    title: 'Word Break',
    slug: 'word-break',
    difficulty: 'Medium',
    topics: ['Dynamic Programming', 'Strings'],
    tags: ['DP', 'Trie', 'String'],
    description: `Given a string \`s\` and a dictionary of strings \`wordDict\`, return \`true\` if \`s\` can be segmented into a space-separated sequence of one or more dictionary words.`,
    examples: [
      { input: 'leetcode\n2\nleet code', output: 'true', explanation: 'Can segment as "leet code".' },
      { input: 'applepenapple\n2\napple pen', output: 'true', explanation: 'Can segment as "apple pen apple".' },
      { input: 'catsandog\n5\ncats dog sand and cat', output: 'false', explanation: 'Cannot segment.' },
    ],
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000'],
    inputFormat: 'Line 1: string s\nLine 2: K (number of words in dict)\nLine 3: K space-separated words',
    outputFormat: 'true or false',
    hints: ['dp[i] represents if substring s[0...i] can be segmented.'],
    editorial: 'DP array of length n+1 checking valid prefix matches.',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length >= 3) {
  const s = parts[0];
  const k = parseInt(parts[1]);
  const dict = new Set(parts.slice(2, 2 + k));
  
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && dict.has(s.substring(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  console.log(dp[s.length] ? 'true' : 'false');
}`,
      python: `import sys

parts = sys.stdin.read().split()
if len(parts) >= 3:
    s = parts[0]
    k = int(parts[1])
    word_dict = set(parts[2:2+k])
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_dict:
                dp[i] = True
                break
    print('true' if dp[len(s)] else 'false')`,
    },
    testCases: [
      { input: 'leetcode\n2\nleet code', expectedOutput: 'true', isPublic: true },
      { input: 'applepenapple\n2\napple pen', expectedOutput: 'true', isPublic: true },
      { input: 'catsandog\n5\ncats dog sand and cat', expectedOutput: 'false', isPublic: false },
    ],
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    topics: ['Two Pointers', 'Dynamic Programming', 'Stack'],
    tags: ['Two Pointers', 'Array', 'Monotonic Stack'],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', output: '6', explanation: 'Total 6 units of rain water are trapped.' },
      { input: '6\n4 2 0 3 2 5', output: '9', explanation: 'Total 9 units of rain water are trapped.' },
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    inputFormat: 'Line 1: N\nLine 2: N space-separated heights',
    outputFormat: 'Total units of trapped water',
    hints: ['At each bar, water trapped is min(maxLeft, maxRight) - height[i]. Use two pointers.'],
    editorial: 'Two pointers moving inward with leftMax and rightMax solves in O(N) time and O(1) space.',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length > 1) {
  const n = parseInt(parts[0]);
  const h = parts.slice(1, 1 + n).map(Number);
  let l = 0, r = h.length - 1, lMax = 0, rMax = 0, water = 0;
  while (l < r) {
    if (h[l] <= h[r]) {
      if (h[l] >= lMax) lMax = h[l];
      else water += lMax - h[l];
      l++;
    } else {
      if (h[r] >= rMax) rMax = h[r];
      else water += rMax - h[r];
      r--;
    }
  }
  console.log(water);
}`,
      python: `import sys

parts = sys.stdin.read().split()
if parts:
    n = int(parts[0])
    h = [int(x) for x in parts[1:1+n]]
    l, r = 0, len(h) - 1
    l_max, r_max, water = 0, 0, 0
    while l < r:
        if h[l] <= h[r]:
            if h[l] >= l_max:
                l_max = h[l]
            else:
                water += l_max - h[l]
            l += 1
        else:
            if h[r] >= r_max:
                r_max = h[r]
            else:
                water += r_max - h[r]
            r -= 1
    print(water)`,
    },
    testCases: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', isPublic: true },
      { input: '6\n4 2 0 3 2 5', expectedOutput: '9', isPublic: true },
      { input: '3\n2 0 2', expectedOutput: '2', isPublic: false },
    ],
  },
  {
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    topics: ['Binary Search', 'Arrays'],
    tags: ['Binary Search', 'Divide and Conquer'],
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the **median** of the two sorted arrays.

The overall run time complexity should be \`O(log (m+n))\`.`,
    examples: [
      { input: '2 1\n1 3\n2', output: '2.0', explanation: 'Merged array = [1,2,3] and median is 2.0.' },
      { input: '2 2\n1 2\n3 4', output: '2.5', explanation: 'Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.' },
    ],
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000', '1 <= m + n <= 2000'],
    inputFormat: 'Line 1: M N\nLine 2: M space-separated sorted numbers (if M > 0)\nLine 3: N space-separated sorted numbers (if N > 0)',
    outputFormat: 'Float formatted with one decimal place',
    hints: ['Binary search on the partition of the smaller array.'],
    editorial: 'Partitioning both arrays such that all elements on left are <= all elements on right.',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length >= 2) {
  const m = parseInt(parts[0]);
  const n = parseInt(parts[1]);
  let idx = 2;
  const a = [];
  for (let i = 0; i < m; i++) a.push(parseFloat(parts[idx++]));
  const b = [];
  for (let i = 0; i < n; i++) b.push(parseFloat(parts[idx++]));
  
  const merged = a.concat(b).sort((x, y) => x - y);
  const mid = Math.floor(merged.length / 2);
  let median = merged.length % 2 === 0 ? (merged[mid - 1] + merged[mid]) / 2 : merged[mid];
  console.log(median.toFixed(1));
}`,
      python: `import sys

parts = sys.stdin.read().split()
if len(parts) >= 2:
    m, n = int(parts[0]), int(parts[1])
    idx = 2
    a = [float(parts[idx + i]) for i in range(m)]
    idx += m
    b = [float(parts[idx + i]) for i in range(n)]
    merged = sorted(a + b)
    mid = len(merged) // 2
    if len(merged) % 2 == 0:
        ans = (merged[mid - 1] + merged[mid]) / 2
    else:
        ans = merged[mid]
    print(f"{ans:.1f}")`,
    },
    testCases: [
      { input: '2 1\n1 3\n2', expectedOutput: '2.0', isPublic: true },
      { input: '2 2\n1 2\n3 4', expectedOutput: '2.5', isPublic: true },
      { input: '0 2\n\n1 2', expectedOutput: '1.5', isPublic: false },
    ],
  },
  {
    title: 'N-Queens',
    slug: 'n-queens',
    difficulty: 'Hard',
    topics: ['Backtracking'],
    tags: ['Backtracking', 'Recursion'],
    description: `The **n-queens** puzzle is the problem of placing \`n\` queens on an \`n x n\` chessboard such that no two queens attack each other.

Given an integer \`n\`, return the **total number of distinct solutions** to the n-queens puzzle.`,
    examples: [
      { input: '4', output: '2', explanation: 'There are two distinct solutions to the 4-queens puzzle.' },
      { input: '1', output: '1', explanation: '1 solution exists.' },
    ],
    constraints: ['1 <= n <= 12'],
    inputFormat: 'Integer N',
    outputFormat: 'Integer count of distinct solutions',
    hints: ['Place queen row by row and maintain sets of attacked columns and diagonals.'],
    editorial: 'Standard backtracking checking col, diag1 (row - col), and diag2 (row + col).',
    starterCode: {
      javascript: `const fs = require('fs');

const n = parseInt(fs.readFileSync(0, 'utf-8').trim());
let count = 0;
const cols = new Set(), d1 = new Set(), d2 = new Set();

function backtrack(row) {
  if (row === n) { count++; return; }
  for (let c = 0; c < n; c++) {
    if (cols.has(c) || d1.has(row - c) || d2.has(row + c)) continue;
    cols.add(c); d1.add(row - c); d2.add(row + c);
    backtrack(row + 1);
    cols.delete(c); d1.delete(row - c); d2.delete(row + c);
  }
}

backtrack(0);
console.log(count);`,
      python: `import sys

n = int(sys.stdin.read().strip())
cols, d1, d2 = set(), set(), set()
count = 0

def backtrack(r):
    global count
    if r == n:
        count += 1
        return
    for c in range(n):
        if c in cols or (r - c) in d1 or (r + c) in d2:
            continue
        cols.add(c)
        d1.add(r - c)
        d2.add(r + c)
        backtrack(r + 1)
        cols.remove(c)
        d1.remove(r - c)
        d2.remove(r + c)

backtrack(0)
print(count)`,
    },
    testCases: [
      { input: '4', expectedOutput: '2', isPublic: true },
      { input: '1', expectedOutput: '1', isPublic: true },
      { input: '5', expectedOutput: '10', isPublic: false },
      { input: '8', expectedOutput: '92', isPublic: false },
    ],
  },
  {
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'Medium',
    topics: ['Arrays', 'Sorting'],
    tags: ['Intervals', 'Array'],
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return the count of resulting intervals.`,
    examples: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', output: '3', explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6]. Total merged count = 3.' },
      { input: '2\n1 4\n4 5', output: '1', explanation: 'Intervals [1,4] and [4,5] overlap into [1,5]. Total count = 1.' },
    ],
    constraints: ['1 <= intervals.length <= 10^4', 'start_i <= end_i'],
    inputFormat: 'Line 1: N\nNext N lines: start end',
    outputFormat: 'Count of merged intervals',
    hints: ['Sort intervals by start time, then merge consecutively.'],
    editorial: 'Sort intervals by start time. Maintain current interval and merge if next start <= current end.',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length > 1) {
  const n = parseInt(parts[0]);
  const intervals = [];
  let idx = 1;
  for (let i = 0; i < n; i++) {
    intervals.push([parseInt(parts[idx++]), parseInt(parts[idx++])]);
  }
  intervals.sort((a, b) => a[0] - b[0]);
  
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const curr = intervals[i];
    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  console.log(merged.length);
}`,
      python: `import sys

parts = sys.stdin.read().split()
if parts:
    n = int(parts[0])
    intervals = []
    idx = 1
    for _ in range(n):
        intervals.append([int(parts[idx]), int(parts[idx + 1])])
        idx += 2
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for curr in intervals[1:]:
        if curr[0] <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], curr[1])
        else:
            merged.append(curr)
    print(len(merged))`,
    },
    testCases: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', expectedOutput: '3', isPublic: true },
      { input: '2\n1 4\n4 5', expectedOutput: '1', isPublic: true },
      { input: '3\n1 4\n2 3\n5 8', expectedOutput: '2', isPublic: false },
    ],
  },
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    topics: ['Dynamic Programming', 'Math'],
    tags: ['DP', 'Fibonacci'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: '2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps' },
      { input: '3', output: '3', explanation: '1. 1+1+1\n2. 1+2\n3. 2+1' },
    ],
    constraints: ['1 <= n <= 45'],
    inputFormat: 'Integer N',
    outputFormat: 'Integer count of distinct ways',
    hints: ['dp[i] = dp[i-1] + dp[i-2], which is the Fibonacci sequence.'],
    editorial: 'Classic Fibonacci recurrence relation solved in O(N).',
    starterCode: {
      javascript: `const fs = require('fs');

const n = parseInt(fs.readFileSync(0, 'utf-8').trim());
if (n <= 2) { console.log(n); process.exit(0); }
let a = 1, b = 2;
for (let i = 3; i <= n; i++) {
  const c = a + b;
  a = b;
  b = c;
}
console.log(b);`,
      python: `import sys

n = int(sys.stdin.read().strip())
if n <= 2:
    print(n)
else:
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    print(b)`,
    },
    testCases: [
      { input: '2', expectedOutput: '2', isPublic: true },
      { input: '3', expectedOutput: '3', isPublic: true },
      { input: '5', expectedOutput: '8', isPublic: false },
      { input: '10', expectedOutput: '89', isPublic: false },
    ],
  },
  {
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    difficulty: 'Medium',
    topics: ['Hashing', 'Strings'],
    tags: ['Hash Table', 'String', 'Sorting'],
    description: `Given an array of strings \`strs\`, group the anagrams together and return the count of distinct anagram groups.`,
    examples: [
      { input: '6\neat tea tan ate nat bat', output: '3', explanation: 'Groups: ["bat"], ["nat","tan"], ["ate","eat","tea"]. Count = 3.' },
      { input: '1\na', output: '1', explanation: 'Single group.' },
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100'],
    inputFormat: 'Line 1: N\nLine 2: N space-separated words',
    outputFormat: 'Count of anagram groups',
    hints: ['Sort each word alphabetically and use the sorted word as a key in a hash map.'],
    editorial: 'Hash map with sorted string key runs in O(N * K log K).',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length > 1) {
  const n = parseInt(parts[0]);
  const words = parts.slice(1, 1 + n);
  const map = new Map();
  for (const w of words) {
    const key = w.split('').sort().join('');
    map.set(key, (map.get(key) || 0) + 1);
  }
  console.log(map.size);
}`,
      python: `import sys

parts = sys.stdin.read().split()
if parts:
    n = int(parts[0])
    words = parts[1:1+n]
    groups = {}
    for w in words:
        key = ''.join(sorted(w))
        groups[key] = groups.get(key, 0) + 1
    print(len(groups))`,
    },
    testCases: [
      { input: '6\neat tea tan ate nat bat', expectedOutput: '3', isPublic: true },
      { input: '1\na', expectedOutput: '1', isPublic: true },
      { input: '4\nab ba cd dc', expectedOutput: '2', isPublic: false },
    ],
  },
  {
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    difficulty: 'Medium',
    topics: ['Hashing', 'Heap'],
    tags: ['Hash Table', 'Bucket Sort', 'Heap'],
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements in ascending order.`,
    examples: [
      { input: '6 2\n1 1 1 2 2 3', output: '1 2', explanation: '1 occurs 3 times, 2 occurs 2 times.' },
      { input: '1 1\n1', output: '1', explanation: 'Single element 1.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'k is in range [1, number of unique elements]'],
    inputFormat: 'Line 1: N K\nLine 2: N space-separated numbers',
    outputFormat: 'K space-separated numbers in ascending order',
    hints: ['Count frequencies with a map, then sort or use bucket sort.'],
    editorial: 'Count frequency in O(N), bucket sort in O(N) or min-heap in O(N log K).',
    starterCode: {
      javascript: `const fs = require('fs');

const parts = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (parts.length >= 2) {
  const n = parseInt(parts[0]);
  const k = parseInt(parts[1]);
  const nums = parts.slice(2, 2 + n).map(Number);
  
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) || 0) + 1);
  
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const topK = sorted.slice(0, k).map(x => x[0]).sort((a, b) => a - b);
  console.log(topK.join(' '));
}`,
      python: `import sys
from collections import Counter

parts = sys.stdin.read().split()
if len(parts) >= 2:
    n = int(parts[0])
    k = int(parts[1])
    nums = [int(x) for x in parts[2:2+n]]
    counts = Counter(nums)
    most_common = [x[0] for x in counts.most_common(k)]
    print(*(sorted(most_common)))`,
    },
    testCases: [
      { input: '6 2\n1 1 1 2 2 3', expectedOutput: '1 2', isPublic: true },
      { input: '1 1\n1', expectedOutput: '1', isPublic: true },
      { input: '7 2\n4 4 4 2 2 1 3', expectedOutput: '2 4', isPublic: false },
    ],
  },
  {
    title: 'Invert Binary Tree Height',
    slug: 'invert-binary-tree-height',
    difficulty: 'Easy',
    topics: ['Trees', 'Recursion'],
    tags: ['Binary Tree', 'DFS'],
    description: `Given the number of nodes \`n\` of a complete binary tree, calculate its height (the number of edges on the longest path from root to leaf, where a 1-node tree has height 0).`,
    examples: [
      { input: '7', output: '2', explanation: 'A 7-node complete tree has 3 levels, height = 2.' },
      { input: '1', output: '0', explanation: 'Single root node has height 0.' },
    ],
    constraints: ['1 <= n <= 10^6'],
    inputFormat: 'Integer N',
    outputFormat: 'Integer height',
    hints: ['Height is floor(log2(n)).'],
    editorial: 'Math: Math.floor(Math.log2(n)).',
    starterCode: {
      javascript: `const fs = require('fs');
const n = parseInt(fs.readFileSync(0, 'utf-8').trim());
console.log(Math.floor(Math.log2(n)));`,
      python: `import sys, math
n = int(sys.stdin.read().strip())
print(int(math.log2(n)))`,
    },
    testCases: [
      { input: '7', expectedOutput: '2', isPublic: true },
      { input: '1', expectedOutput: '0', isPublic: true },
      { input: '15', expectedOutput: '3', isPublic: false },
    ],
  },
  {
    title: 'Longest Valid Parentheses Length',
    slug: 'longest-valid-parentheses-length',
    difficulty: 'Hard',
    topics: ['Dynamic Programming', 'Stack'],
    tags: ['DP', 'Stack', 'String'],
    description: `Given a string containing just the characters \`'('\` and \`')'\`, return the length of the longest valid (well-formed) parentheses substring.`,
    examples: [
      { input: '(()', output: '2', explanation: 'The longest valid parentheses substring is "()".' },
      { input: ')()())', output: '4', explanation: 'The longest valid parentheses substring is "()()".' },
      { input: '', output: '0', explanation: 'Empty string.' },
    ],
    constraints: ['0 <= s.length <= 3 * 10^4'],
    inputFormat: 'String of parentheses',
    outputFormat: 'Integer length',
    hints: ['Stack initialized with -1 as base index.'],
    editorial: 'Maintain index stack initialized with -1. When closing bracket is seen, pop and update max length.',
    starterCode: {
      javascript: `const fs = require('fs');

const s = fs.readFileSync(0, 'utf-8').trim();
const stack = [-1];
let maxLen = 0;
for (let i = 0; i < s.length; i++) {
  if (s[i] === '(') {
    stack.push(i);
  } else {
    stack.pop();
    if (stack.length === 0) {
      stack.push(i);
    } else {
      maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
    }
  }
}
console.log(maxLen);`,
      python: `import sys

s = sys.stdin.read().strip()
stack = [-1]
max_len = 0
for i, ch in enumerate(s):
    if ch == '(':
        stack.append(i)
    else:
        stack.pop()
        if not stack:
            stack.append(i)
        else:
            max_len = max(max_len, i - stack[-1])
print(max_len)`,
    },
    testCases: [
      { input: '(()', expectedOutput: '2', isPublic: true },
      { input: ')()())', expectedOutput: '4', isPublic: true },
      { input: '', expectedOutput: '0', isPublic: false },
      { input: '()(())', expectedOutput: '6', isPublic: false },
    ],
  },
  {
    title: 'Fibonacci Number',
    slug: 'fibonacci-number',
    difficulty: 'Easy',
    topics: ['Math', 'Dynamic Programming', 'Recursion'],
    tags: ['Memoization', 'Math'],
    description: `The **Fibonacci numbers**, commonly denoted \`F(n)\` form a sequence, called the **Fibonacci sequence**, such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`.

Given \`n\`, calculate \`F(n)\`.`,
    examples: [
      { input: '2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.' },
      { input: '3', output: '2', explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2.' },
      { input: '4', output: '3', explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.' },
    ],
    constraints: ['0 <= n <= 30'],
    inputFormat: 'Integer N',
    outputFormat: 'Integer F(N)',
    hints: ['Iterative computation with two variables in O(N).'],
    editorial: 'Iterative approach in O(N) time and O(1) space.',
    starterCode: {
      javascript: `const fs = require('fs');
const n = parseInt(fs.readFileSync(0, 'utf-8').trim());
if (n <= 1) { console.log(n); process.exit(0); }
let a = 0, b = 1;
for (let i = 2; i <= n; i++) {
  const c = a + b;
  a = b;
  b = c;
}
console.log(b);`,
      python: `import sys
n = int(sys.stdin.read().strip())
if n <= 1:
    print(n)
else:
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    print(b)`,
    },
    testCases: [
      { input: '2', expectedOutput: '1', isPublic: true },
      { input: '3', expectedOutput: '2', isPublic: true },
      { input: '4', expectedOutput: '3', isPublic: false },
      { input: '10', expectedOutput: '55', isPublic: false },
    ],
  },
];

module.exports = {
  achievementsData,
  problemsData,
};
