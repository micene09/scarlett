FROM node:12

# Repository update
RUN apt-get -y update && apt-get -y dist-upgrade && apt-get -y install --no-install-recommends apt-utils

# Installation of needed/common packages
RUN apt-get -y install sudo curl dos2unix apt-transport-https ca-certificates

# Installation of dev packages
RUN apt-get -y install git git-flow zsh

# Oh-my-zsh Installation
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# ZSH Config copy
COPY ./assets/.zshrc /root/
RUN dos2unix /root/.zshrc

# Yarn Installation
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list && apt-get update && apt-get -y install yarn

# Posh-git internals override
COPY ./assets/posh-git-prompt.zsh /root/.oh-my-zsh/custom/
RUN dos2unix /root/.oh-my-zsh/custom/posh-git-prompt.zsh

# Clean up
RUN apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*