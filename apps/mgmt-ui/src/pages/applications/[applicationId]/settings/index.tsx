export async function getServerSideProps() {
  return {
    redirect: {
      destination: './settings/webhooks',
      permanent: false,
    },
  };
}

export default async function Home() {
  return null;
}
