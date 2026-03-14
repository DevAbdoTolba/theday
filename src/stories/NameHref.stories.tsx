import type { Meta, StoryObj } from "@storybook/react";
import NameHref from "@/components/NameHref";

const meta = {
  title: "Components/NameHref",
  component: NameHref,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Typography heading with an array of associated hyperlinks displayed beneath it. Used to display team member names with links to their GitHub profiles or social pages.",
      },
    },
  },
  argTypes: {
    name: { control: "text", description: "Section heading label" },
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "subtitle1", "subtitle2"],
      description: "MUI Typography variant",
    },
    dataName: { control: "object", description: "Array of link display names" },
    dataHref: { control: "object", description: "Array of URLs matching dataName positions" },
  },
} satisfies Meta<typeof NameHref>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Team Members",
    variant: "h4",
    dataName: ["Abdo Tolba", "Contributor 2"],
    dataHref: ["https://github.com/DevAbdoTolba", "https://github.com"],
  },
};

export const SingleLink: Story = {
  args: {
    name: "Lead Developer",
    variant: "h5",
    dataName: ["Abdo Tolba"],
    dataHref: ["https://github.com/DevAbdoTolba"],
  },
};

export const ManyLinks: Story = {
  args: {
    name: "Contributors",
    variant: "h6",
    dataName: ["Dev A", "Dev B", "Dev C", "Dev D"],
    dataHref: ["#", "#", "#", "#"],
  },
};
