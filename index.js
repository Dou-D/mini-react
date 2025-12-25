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
    },
  };
}

function performUnitOfWork(fiber) {
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
    if (index == 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
  if (fiber.child) {
    return fiber.child;
  }
}

let nextUnitOfWork = null;

function workLoop(deadline) {
  let shoudYield = false;
  while (nextUnitOfWork && !shoudYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shoudYield = deadline.timeRemaining() < 1;
  }
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
