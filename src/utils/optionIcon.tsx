import {
  IconClock,
  IconCogwheel,
  IconCrossCircle,
  IconHammers,
  IconLightbulb,
  IconLocation,
  IconPen,
  IconPlaybackPause,
  IconQuestionCircle,
  IconScrollContent,
  IconShield,
  IconUser,
} from 'hds-react/icons';

const optionIcon = {
  proposal: <IconQuestionCircle />,
  design: <IconLightbulb />,
  programming: <IconCogwheel />,
  // IO-863: shared icon for all three planning sub-phases. IconScrollContent
  // matches the old constructionPlan icon, which fit "design document" the
  // best out of the three.
  designPlanning: <IconScrollContent />,
  draftInitiation: <IconScrollContent />,
  draftApproval: <IconScrollContent />,
  constructionPlan: <IconScrollContent />,
  constructionWait: <IconPlaybackPause />,
  construction: <IconHammers />,
  warrantyPeriod: <IconClock />,
  completed: <IconShield />,
  constructionPreparation: <IconPen />,
  suspended: <IconCrossCircle />,
  location: <IconLocation />,
  person: <IconUser />,
};

export default optionIcon;
