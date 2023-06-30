import {
  IconArrowRightDashed,
  IconClock,
  IconCogwheel,
  IconHammers,
  IconLightbulb,
  IconLocation,
  IconPlaybackPause,
  IconQuestionCircle,
  IconScrollContent,
  IconShield,
  IconThumbsUp,
  IconUser,
} from 'hds-react/icons';

const optionIcon = {
  proposal: <IconQuestionCircle />,
  design: <IconLightbulb />,
  programming: <IconCogwheel />,
  draftInitiation: <IconArrowRightDashed />,
  draftApproval: <IconThumbsUp />,
  constructionPlan: <IconScrollContent />,
  constructionWait: <IconPlaybackPause />,
  construction: <IconHammers />,
  warrantyPeriod: <IconClock />,
  completed: <IconShield />,
  location: <IconLocation />,
  person: <IconUser />,
};

export default optionIcon;
