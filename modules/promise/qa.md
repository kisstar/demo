# Q & A

Q：如何改变 Promise 的状态？

A：可以通过下面三种方式进行改变：

- 调用 `resolve()`： `pending` -> `fulfilled`；
- 调用 `reject()`： `pending` -> `rejected`；
- 抛出异常 `throw()`：`pending` -> `rejected`。

Q：如果一个 Promise 指定多个成功或失败的调用，在对应状态转变后都会执行吗？

A：会。

Q：改变 Promise 状态和指定回调的顺序？

A：都有可能，通常会先指定回调。

Q：如何先改变状态再指定回调？

A：在执行器中同步调用 `resolve/reject`，或者更晚的调用 `then()` 方法。

Q：`then()` 方法返回的新的 Promise 的状态是由什么决定的？

A：由通过其指定的回调函数的执行结果决定：

- 如果抛出异常 -> `rejected`；
- 如果返回的非 `thenable` -> `resolved`；
- 否则，返回的 Promise 对象的最终状态由 `then()` 方法执行决定。

Q：Promise 如何串联多个操作任务？

A：通过返回一个新的 Promise 来实现链式调用。

Q：Promise 异常的传透？

A：当使用 Promise 的链式调用时，可以在链子的最后指定失败的回调，前面任何一个操作出现了异常，都会被传到这个失败回调中进行处理。

Q：如何中断 Promise 链？

A：如果需要从某个节点开始不再执行后续的回调函数，可以在该节点返回一个状态为 `pending` 且不会改变状态的 Promise 对象。
