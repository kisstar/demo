import { BASE_DIR } from "./url";

export const ALL_DEMOS = [
	{
		name: "CSS",
		children: [
			{
				name: "【视差滚动】通过固定背景实现视差滚动",
				url: `${BASE_DIR}parallax/bg.html`,
			},
			{
				name: "【视差滚动】通过监听 Scroll 事件实现视差滚动",
				url: `${BASE_DIR}parallax/event.html`,
			},
			{
				name: "【视差滚动】通过固定定位实现视差滚动",
				url: `${BASE_DIR}parallax/fixed.html`,
			},
			{
				name: "【视差滚动】通过 3D 转换实现视差滚动",
				url: `${BASE_DIR}parallax/transform.html`,
			},
			{
				name: "【Flex 多列布局】通过 Flex 实现多列布局，并使用负外边距（margin）解决首列多余的边距",
				url: `${BASE_DIR}flex/margin-list.html`,
			},
			{
				name: "【Flex 多列布局】通过 Flex 实现多列布局，并使用 gap 设置边距",
				url: `${BASE_DIR}flex/gap-list.html`,
			},
		],
	},
];
