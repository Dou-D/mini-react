const container = document.querySelector("#app");

// const div = <div>div元素</div>;

// 文本类型的children
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });
  return dom;
}

function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    }
  }
}

function performUnitOfWork(fiber) {
  // 开始处理某个fiber时，才创建他的真实dom，否则它一直作为vdom保存
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
  // 有孩子的话 优先遍历孩子 类似树的先根遍历
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  // 遍历完孩子后，先找兄弟，完成第一个兄弟及其孩子的遍历 然后第一个兄弟的会找它的第一个兄弟 依次找完为止
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 找父节点的兄弟
    nextFiber = nextFiber.parent;
  }
}

let nextUnitOfWork = null;

// workLoop会无限的执行下去，但并不是递归调用，本次的nextUnitOfWork执行完成之后并且没有空闲时间时，workLoop会出栈，全局变量nextUnitOfWork会保存下次要执行的fiber
function workLoop(deadline) {
  // 首次执行 shouldYield为false 也就是根元素和他的子元素必然会被处理
  let shoudYield = false;
  while (nextUnitOfWork && !shoudYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 检查是否有剩余时间
    shoudYield = deadline.timeRemaining() < 1;
  }
  // 将任务放到下一帧执行
  requestIdleCallback(workLoop);
}

const Didact = {
  createElement,
  render,
};

const testElement = {
  type: "div",
  props: {
    title: "father",
    children: [
      {
        type: "span",
        props: {
          children: [
            {
              type: "TEXT_ELEMENT",
              props: {
                nodeValue: "span1", // 建议：文本内容放在这里
                children: [], // 建议：叶子节点的 children 为空数组
              },
            },
          ],
        },
      },
      {
        type: "span",
        props: {
          children: [
            {
              type: "TEXT_ELEMENT",
              props: {
                nodeValue: "span2",
                children: [],
              },
            },
          ],
        },
      },
    ],
  },
};

Didact.render(testElement, container);
